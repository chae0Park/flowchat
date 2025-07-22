// WebSocket service for real-time communication
export interface WebSocketMessage {
  type: 'message' | 'typing' | 'user_joined' | 'user_left' | 'reaction' | 'file_upload';
  data: any;
  timestamp: string;
  userId: string;
  channelId: string;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  channelId: string;
  isTyping: boolean;
}

export class WebSocketService {
  protected ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  protected messageHandlers: Map<string, (data: any) => void> = new Map();
  protected isConnected = false;

  constructor(private userId: string, private token: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // In production, this would be your WebSocket server URL
        const wsUrl = `ws://localhost:8080/ws?token=${this.token}&userId=${this.userId}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.isConnected = false;
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.data);
    }
  }

  // Subscribe to specific message types
  on(messageType: string, handler: (data: any) => void) {
    this.messageHandlers.set(messageType, handler);
  }

  // Send a chat message
  sendMessage(channelId: string, content: string, files?: File[]) {
    if (!this.isConnected || !this.ws) {
      console.error('WebSocket not connected');
      return;
    }

    const message: WebSocketMessage = {
      type: 'message',
      data: {
        channelId,
        content,
        files: files?.map(f => ({ name: f.name, size: f.size, type: f.type }))
      },
      timestamp: new Date().toISOString(),
      userId: this.userId,
      channelId
    };

    this.ws.send(JSON.stringify(message));
  }

  // Send typing indicator
  sendTyping(channelId: string, isTyping: boolean) {
    if (!this.isConnected || !this.ws) return;

    const message: WebSocketMessage = {
      type: 'typing',
      data: { channelId, isTyping },
      timestamp: new Date().toISOString(),
      userId: this.userId,
      channelId
    };

    this.ws.send(JSON.stringify(message));
  }

  // Send reaction
  sendReaction(messageId: string, emoji: string, channelId: string) {
    if (!this.isConnected || !this.ws) return;

    const message: WebSocketMessage = {
      type: 'reaction',
      data: { messageId, emoji },
      timestamp: new Date().toISOString(),
      userId: this.userId,
      channelId
    };

    this.ws.send(JSON.stringify(message));
  }

  // Join a channel
  joinChannel(channelId: string) {
    if (!this.isConnected || !this.ws) return;

    const message: WebSocketMessage = {
      type: 'user_joined',
      data: { channelId },
      timestamp: new Date().toISOString(),
      userId: this.userId,
      channelId
    };

    this.ws.send(JSON.stringify(message));
  }

  // Leave a channel
  leaveChannel(channelId: string) {
    if (!this.isConnected || !this.ws) return;

    const message: WebSocketMessage = {
      type: 'user_left',
      data: { channelId },
      timestamp: new Date().toISOString(),
      userId: this.userId,
      channelId
    };

    this.ws.send(JSON.stringify(message));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

// Mock WebSocket service for development
export class MockWebSocketService extends WebSocketService {
  private mockUsers = [
    { id: '1', name: '김민수', avatar: '김' },
    { id: '2', name: '이지혜', avatar: '이' },
    { id: '3', name: '박준호', avatar: '박' },
    { id: '4', name: '최유진', avatar: '최' }
  ];

  connect(): Promise<void> {
    return new Promise((resolve) => {
      console.log('Mock WebSocket connected');
      this.isConnected = true;
      
      // Simulate random messages from other users
      this.startMockMessages();
      resolve();
    });
  }

  private startMockMessages() {
    // Simulate typing indicators
    setInterval(() => {
      if (Math.random() > 0.8) {
        const randomUser = this.mockUsers[Math.floor(Math.random() * this.mockUsers.length)];
        const handler = this.messageHandlers.get('typing');
        if (handler) {
          handler({
            userId: randomUser.id,
            userName: randomUser.name,
            channelId: 'general',
            isTyping: true
          });

          // Stop typing after 2 seconds
          setTimeout(() => {
            handler({
              userId: randomUser.id,
              userName: randomUser.name,
              channelId: 'general',
              isTyping: false
            });
          }, 2000);
        }
      }
    }, 10000);

    // Simulate random messages
    setInterval(() => {
      if (Math.random() > 0.7) {
        const randomUser = this.mockUsers[Math.floor(Math.random() * this.mockUsers.length)];
        const messages = [
          '안녕하세요! 오늘 회의 준비는 어떻게 되고 있나요?',
          '새로운 기능 개발이 완료되었습니다! 🎉',
          '점심 메뉴 추천 받습니다~',
          '코드 리뷰 부탁드려요!',
          '오늘 날씨가 정말 좋네요 ☀️'
        ];
        
        const handler = this.messageHandlers.get('message');
        if (handler) {
          handler({
            id: Date.now().toString(),
            user: randomUser.name,
            avatar: randomUser.avatar,
            content: messages[Math.floor(Math.random() * messages.length)],
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            reactions: [],
            files: []
          });
        }
      }
    }, 15000);
  }
}