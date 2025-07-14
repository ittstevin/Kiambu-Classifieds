const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const cacheService = require('../services/cacheService');

// Rate limiting configurations
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
const rateLimiters = {
  // General API rate limiting
  general: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per 15 minutes
    'Too many requests from this IP'
  ),

  // Authentication endpoints
  auth: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // 5 login attempts per 15 minutes
    'Too many login attempts'
  ),

  // Ad posting
  adPost: createRateLimiter(
    60 * 60 * 1000, // 1 hour
    10, // 10 ads per hour
    'Too many ad posts'
  ),

  // Search endpoints
  search: createRateLimiter(
    5 * 60 * 1000, // 5 minutes
    50, // 50 searches per 5 minutes
    'Too many search requests'
  ),

  // File uploads
  upload: createRateLimiter(
    60 * 60 * 1000, // 1 hour
    20, // 20 uploads per hour
    'Too many file uploads'
  ),

  // Messaging
  messaging: createRateLimiter(
    60 * 1000, // 1 minute
    30, // 30 messages per minute
    'Too many messages'
  )
};

// Spam protection middleware
const spamProtection = async (req, res, next) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const userId = req.user?.id;

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /bot|crawler|spider/i,
      /scraper|harvester/i,
      /mass|bulk|automated/i
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => 
      userAgent && pattern.test(userAgent)
    );

    if (isSuspicious) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Suspicious activity detected'
      });
    }

    // Rate limiting per user/IP
    const rateLimitKey = userId ? `user:${userId}` : `ip:${clientIP}`;
    const currentCount = await cacheService.incrementRateLimit(rateLimitKey, 3600);
    
    if (currentCount > 1000) { // 1000 requests per hour per user/IP
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests from this source'
      });
    }

    next();
  } catch (error) {
    console.error('Spam protection error:', error);
    next();
  }
};

// Input validation middleware
const validateInput = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message
        });
      }
      next();
    } catch (error) {
      console.error('Input validation error:', error);
      res.status(500).json({
        error: 'Validation error',
        message: 'Invalid input data'
      });
    }
  };
};

// Content security policy
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:", "blob:"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    connectSrc: ["'self'", "wss:", "ws:"],
    mediaSrc: ["'self'", "https:", "blob:"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: []
  }
};

// CORS configuration
const corsConfig = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://kiambuclass.com',
      'https://www.kiambuclass.com',
      'https://kiambu.kiambuclass.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Custom headers for Kiambu Classifieds
  res.setHeader('X-Powered-By', 'Kiambu Classifieds');
  res.setHeader('X-Server', 'Kiambu-Classifieds/1.0');
  
  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${logData.method} ${logData.url} - ${logData.status} (${logData.duration})`);
    }
    
    // Store in cache for analytics
    cacheService.incrementCounter(`requests:${req.method}:${res.statusCode}`);
  });
  
  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // MongoDB errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: Object.values(err.errors).map(e => e.message).join(', ')
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID',
      message: 'Invalid resource ID provided'
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate Error',
      message: 'Resource already exists'
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Invalid authentication token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      message: 'Authentication token has expired'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

// Not found middleware
const notFound = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
};

// Health check middleware
const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
};

module.exports = {
  rateLimiters,
  spamProtection,
  validateInput,
  cspConfig,
  corsConfig,
  securityHeaders,
  requestLogger,
  errorHandler,
  notFound,
  healthCheck
}; 