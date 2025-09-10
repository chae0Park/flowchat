import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import workspaceRoutes from './routes/workspaces';
import channelRoutes from './routes/channels';
import messageRoutes from './routes/messages';
import pollRoutes from './routes/polls';
import eventRoutes from './routes/events';
import workflowRoutes from './routes/workflows';
import fileRoutes from './routes/files';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';

// Import services
import { WebSocketService } from './services/websocket';
import { DatabaseService } from './services/database';
import { RedisService } from './services/redis';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.WS_CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

//const PORT = process.env.PORT || 8080; OG
const HOST = process.env.HOST || 'localhost';
const PORT = parseInt(process.env.PORT || '8080', 10);

// Initialize services
const databaseService = new DatabaseService();
const redisService = new RedisService();
const websocketService = new WebSocketService(io);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files 
//todo: multer 설정 되어 있는지 찾아보기
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/workspaces', authenticateToken, workspaceRoutes);
app.use('/api/channels', authenticateToken, channelRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/polls', authenticateToken, pollRoutes);
app.use('/api/events', authenticateToken, eventRoutes);
app.use('/api/workflows', authenticateToken, workflowRoutes);
app.use('/api/files', authenticateToken, fileRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Initialize WebSocket
websocketService.initialize();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  server.close(() => {
    console.log('HTTP server closed');
    
    // Close database connections
    databaseService.disconnect();
    redisService.disconnect();
    
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  
  server.close(() => {
    console.log('HTTP server closed');
    
    // Close database connections
    databaseService.disconnect();
    redisService.disconnect();
    
    process.exit(0);
  });
});

// Start server
server.listen(PORT, HOST, () => { //values for host: localhost and port: 8080
  console.log(`🚀 FlowTalk Server running on http://${HOST}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔌 WebSocket enabled on port ${PORT}`);
});

export default app;