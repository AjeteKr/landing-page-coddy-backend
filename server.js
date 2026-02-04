import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import routes
import publicCoursesRoutes from './routes/publicCourses.js';
import publicAuthRoutes from './routes/publicAuth.js';
import publicLandingRoutes from './routes/publicLanding.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { validateContent } from './middleware/validation.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());

// CORS configuration - Allow frontend to communicate
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.NONLOGIN_FRONTEND_URL || 'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Content validation middleware
app.use(validateContent);

// Rate limiting - Prevent abuse
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Stricter limit for auth endpoints
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'coddy-nonlogin-backend'
  });
});

// Root/info endpoint - helpful for browser or pinging the function root
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Coddy NonLogin Backend',
    info: 'Use /api/health for a quick health check or /api/public/* for public endpoints',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/public/courses', publicCoursesRoutes);
app.use('/api/auth', publicAuthRoutes);
app.use('/api/landing', publicLandingRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✅ NonLogin Backend Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
