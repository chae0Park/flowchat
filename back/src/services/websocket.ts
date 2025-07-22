import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { db } from './database';
import { redis } from './redis';
import { WebSocketMessage, TypingIndicator } from '../types';

export class WebSocketService {
  private io: Server;
  private connectedUsers: Map<string, Socket> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  initialize() {
    this.io.use(this.authenticateSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));
    console.log('🔌 WebSocket service initialized');
  }

  private async authenticateSocket(socket: Socket, next: (err?: Error) => void) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true, avatar: true, status: true }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  }

  private async handleConnection(socket: Socket) {
    const user = socket.data.user;
    console.log(`👤 User ${user.name} connected (${user.id})`);

    // Store connected user
    this.connectedUsers.set(user.id, socket);

    // Update user status to online
    await this.updateUserStatus(user.id, 'online');

    // Join user to their channels
    await this.joinUserChannels(socket, user.id);

    // Handle events
    socket.on('join_channel', (channelId: string) => this.handleJoinChannel(socket, channelId));
    socket.on('leave_channel', (channelId: string) => this.handleLeaveChannel(socket, channelId));
    socket.on('send_message', (data) => this.handleSendMessage(socket, data));
    socket.on('typing', (data) => this.handleTyping(socket, data));
    socket.on('reaction', (data) => this.handleReaction(socket, data));
    socket.on('disconnect', () => this.handleDisconnect(socket));

    // Send user list to all clients
    this.broadcastUserList();
  }

  private async joinUserChannels(socket: Socket, userId: string) {
    try {
      const channels = await db.channelMember.findMany({
        where: { userId },
        include: { channel: true }
      });

      for (const channelMember of channels) {
        socket.join(channelMember.channel.id);
      }

      console.log(`📢 User ${userId} joined ${channels.length} channels`);
    } catch (error) {
      console.error('Error joining user channels:', error);
    }
  }

  private async handleJoinChannel(socket: Socket, channelId: string) {
    try {
      const user = socket.data.user;
      
      // Verify user has access to channel
      const channelMember = await db.channelMember.findFirst({
        where: { channelId, userId: user.id }
      });

      if (!channelMember) {
        socket.emit('error', { message: 'Access denied to channel' });
        return;
      }

      socket.join(channelId);
      
      // Notify others in the channel
      socket.to(channelId).emit('user_joined', {
        userId: user.id,
        userName: user.name,
        channelId
      });

      console.log(`👤 User ${user.name} joined channel ${channelId}`);
    } catch (error) {
      console.error('Error joining channel:', error);
      socket.emit('error', { message: 'Failed to join channel' });
    }
  }

  private async handleLeaveChannel(socket: Socket, channelId: string) {
    const user = socket.data.user;
    
    socket.leave(channelId);
    
    // Notify others in the channel
    socket.to(channelId).emit('user_left', {
      userId: user.id,
      userName: user.name,
      channelId
    });

    console.log(`👤 User ${user.name} left channel ${channelId}`);
  }

  private async handleSendMessage(socket: Socket, data: any) {
    try {
      const user = socket.data.user;
      const { channelId, content, files, replyTo } = data;

      // Verify user has access to channel
      const channelMember = await db.channelMember.findFirst({
        where: { channelId, userId: user.id }
      });

      if (!channelMember) {
        socket.emit('error', { message: 'Access denied to channel' });
        return;
      }

      // Create message in database
      const message = await db.message.create({
        data: {
          channelId,
          userId: user.id,
          content,
          replyTo,
          files: files ? {
            create: files.map((file: any) => ({
              name: file.name,
              size: file.size,
              type: file.type,
              url: file.url,
              uploadedBy: user.id
            }))
          } : undefined
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          },
          files: true,
          reactions: {
            include: {
              user: {
                select: { id: true, name: true }
              }
            }
          }
        }
      });

      // Broadcast message to channel
      this.io.to(channelId).emit('new_message', {
        id: message.id,
        user: message.user.name,
        avatar: message.user.avatar,
        content: message.content,
        timestamp: message.createdAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        reactions: message.reactions.map(r => ({
          emoji: r.emoji,
          count: 1,
          active: r.userId === user.id
        })),
        files: message.files.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
          url: f.url
        }))
      });

      console.log(`💬 Message sent by ${user.name} in channel ${channelId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private async handleTyping(socket: Socket, data: TypingIndicator) {
    const user = socket.data.user;
    
    // Broadcast typing indicator to others in the channel
    socket.to(data.channelId).emit('typing', {
      userId: user.id,
      userName: user.name,
      channelId: data.channelId,
      isTyping: data.isTyping
    });

    // Store typing state in Redis with expiration
    if (data.isTyping) {
      await redis.set(`typing:${data.channelId}:${user.id}`, user.name, 5);
    } else {
      await redis.del(`typing:${data.channelId}:${user.id}`);
    }
  }

  private async handleReaction(socket: Socket, data: any) {
    try {
      const user = socket.data.user;
      const { messageId, emoji, channelId } = data;

      // Check if reaction already exists
      const existingReaction = await db.reaction.findFirst({
        where: { messageId, userId: user.id, emoji }
      });

      if (existingReaction) {
        // Remove reaction
        await db.reaction.delete({
          where: { id: existingReaction.id }
        });
      } else {
        // Add reaction
        await db.reaction.create({
          data: { messageId, userId: user.id, emoji }
        });
      }

      // Get updated reactions
      const reactions = await db.reaction.groupBy({
        by: ['emoji'],
        where: { messageId },
        _count: { emoji: true }
      });

      // Broadcast reaction update
      this.io.to(channelId).emit('reaction_update', {
        messageId,
        reactions: reactions.map(r => ({
          emoji: r.emoji,
          count: r._count.emoji
        }))
      });

      console.log(`👍 Reaction ${emoji} ${existingReaction ? 'removed' : 'added'} by ${user.name}`);
    } catch (error) {
      console.error('Error handling reaction:', error);
      socket.emit('error', { message: 'Failed to update reaction' });
    }
  }

  private async handleDisconnect(socket: Socket) {
    const user = socket.data.user;
    
    if (user) {
      console.log(`👤 User ${user.name} disconnected (${user.id})`);
      
      // Remove from connected users
      this.connectedUsers.delete(user.id);
      
      // Update user status to offline
      await this.updateUserStatus(user.id, 'offline');
      
      // Clean up typing indicators
      const channels = await db.channelMember.findMany({
        where: { userId: user.id },
        select: { channelId: true }
      });
      
      for (const channel of channels) {
        await redis.del(`typing:${channel.channelId}:${user.id}`);
      }
      
      // Broadcast updated user list
      this.broadcastUserList();
    }
  }

  private async updateUserStatus(userId: string, status: string) {
    try {
      await db.user.update({
        where: { id: userId },
        data: { 
          status,
          lastActive: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }

  private async broadcastUserList() {
    try {
      const onlineUsers = await db.user.findMany({
        where: { status: 'online' },
        select: { id: true, name: true, avatar: true, status: true }
      });

      this.io.emit('user_list_update', onlineUsers);
    } catch (error) {
      console.error('Error broadcasting user list:', error);
    }
  }

  // Public methods for external use
  public async sendNotification(userId: string, notification: any) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit('notification', notification);
    }
  }

  public async broadcastToChannel(channelId: string, event: string, data: any) {
    this.io.to(channelId).emit(event, data);
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}