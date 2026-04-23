import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config';
import { globalRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './utils/errors';
import routes from './routes';
import logger from './utils/logger';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: [config.app.frontendUrl, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Global rate limiter
app.use(globalRateLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// API routes
app.use(`/api/${config.apiVersion}`, routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Gyan Path API',
    version: '1.0.0',
    description: 'Multilingual EdTech Platform Backend',
    documentation: '/api/v1/health',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚀 Gyan Path API server running on port ${PORT}`);
  logger.info(`📚 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 API Version: ${config.apiVersion}`);
  logger.info(`🌐 Health Check: http://localhost:${PORT}/api/${config.apiVersion}/health`);
});

export default app;
