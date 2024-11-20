const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

// Load environment variables
require('dotenv').config();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Essential Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint
app.get('/api/ping', (req, res) => {
  res.json({ message: 'API is running' });
});

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const bookRatingsRoutes = require('./routes/bookRatings');
const bookFavoritesRoutes = require('./routes/bookFavorites');
const bookCommentsRoutes = require('./routes/bookComments');

// Debug middleware to log route registration
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    query: req.query,
    cookies: req.cookies
  });
  next();
});

// Route middleware
app.use('/api/auth', authRoutes);

// Books and related features routes
app.use('/api/books', bookRoutes);          // Core book operations (GET /, GET /:id)
app.use('/api/books', bookRatingsRoutes);   // Rating operations (POST /:id/rate, GET /:id/ratings)
app.use('/api/books', bookFavoritesRoutes); // Favorite operations (POST /:id/favorite, GET /user/favorites)
app.use('/api/books', bookCommentsRoutes);  // Comment operations (POST /:id/comment, GET /:id/comments)

// Route not found middleware (404)
app.use((req, res, next) => {
  console.log('404 - Route not found:', {
    method: req.method,
    path: req.path,
    body: req.body,
    query: req.query
  });
  res.status(404).json({ 
    error: 'Route not found',
    requestedPath: req.path,
    method: req.method
  });
});

// Global error handling
app.use((err, req, res, next) => {
  console.error('Error occurred:', {
    error: err,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });
  
  // Handle specific types of errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Unauthorized access',
      details: process.env.NODE_ENV !== 'production' ? err.message : undefined
    });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: err.message,
      details: process.env.NODE_ENV !== 'production' ? err.details : undefined
    });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      error: 'Database operation failed',
      details: process.env.NODE_ENV !== 'production' ? err.message : undefined
    });
  }
  
  // Default error response
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for origin: http://localhost:3000`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Attempt graceful shutdown
  server.close(() => {
    console.log('Server closed due to uncaught exception');
    process.exit(1);
  });
  
  // If graceful shutdown fails, force exit after 1 second
  setTimeout(() => {
    console.error('Forced shutdown due to uncaught exception');
    process.exit(1);
  }, 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log but don't exit, as this might be handled elsewhere
});

module.exports = app;
