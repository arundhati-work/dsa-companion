import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import problemRoutes from './routes/problems';
import userRoutes from './routes/users';
import aiRoutes from './routes/ai';
import { initializeDatabase } from './utils/database';

// Load environment variables
dotenv.config();

// Debug: Check if OpenAI API key is loaded
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Loaded' : 'Missing');

const app = express();
const PORT = process.env.SERVER_PORT || process.env.PORT || 5001;

console.log('🔧 Server Debug - Environment variables:');
console.log('🔧 Server Debug - SERVER_PORT:', process.env.SERVER_PORT);
console.log('🔧 Server Debug - CLIENT_PORT:', process.env.CLIENT_PORT);
console.log('🔧 Server Debug - PORT (fallback):', PORT);
console.log('🔧 Server Debug - CLIENT_URL:', process.env.CLIENT_URL || `http://localhost:${process.env.CLIENT_PORT || 3000}`);
console.log('🔧 Server Debug - NODE_ENV:', process.env.NODE_ENV || 'development');

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins for local development
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/problems', problemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔧 Server Debug - Starting server initialization...');
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
    
    console.log('🔧 Server Debug - Attempting to start server on port:', PORT);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
      console.log('🔧 Server Debug - Server started successfully');
    });
      } catch (error) {
      console.error('❌ Failed to start server:', error);
      console.error('🔧 Server Debug - Error details:', {
        message: (error as any).message,
        code: (error as any).code,
        errno: (error as any).errno,
        syscall: (error as any).syscall,
        address: (error as any).address,
        port: (error as any).port
      });
      process.exit(1);
    }
}

startServer();

export default app; 