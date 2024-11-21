// Load environment variables first - this must be at the very top
require('dotenv').config();

// Import modules
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Get environment variables with validation
const { NODE_ENV = 'development' } = process.env;
const PORT = process.env.PORT || 3001;
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

// Validate essential environment variables
if (!GOOGLE_BOOKS_API_KEY) {
  console.error('ERROR: GOOGLE_BOOKS_API_KEY is not set in environment variables');
  process.exit(1); // Exit if the API key is missing
}

const app = express();

// Request logging middleware with more details
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Environment Status:', {
    NODE_ENV,
    GOOGLE_BOOKS_API_KEY: GOOGLE_BOOKS_API_KEY ? 'Set' : 'Missing',
    PORT
  });
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

// Health check endpoint with environment info
app.get('/api/ping', (req, res) => {
  res.json({ 
    message: 'API is running',
    environment: NODE_ENV,
    googleBooksApiKey: !!GOOGLE_BOOKS_API_KEY
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const bookRatingsRoutes = require('./routes/bookRatings');
const bookFavoritesRoutes = require('./routes/bookFavorites');
const bookCommentsRoutes = require('./routes/bookComments');

// Debug middleware to log route registration
app.use((req, res, next) => {
  console.log('Request Debug Info:', {
    method: req.method,
    path: req.path,
    query: req.query,
    cookies: req.cookies,
    envVars: {
      nodeEnv: NODE_ENV,
      hasGoogleApiKey: !!GOOGLE_BOOKS_API_KEY
    }
  });
  next();
});

// Route middleware
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/books', bookRatingsRoutes);
app.use('/api/books', bookFavoritesRoutes);
app.use('/api/books', bookCommentsRoutes);

// Route not found middleware (404)
app.use((req, res, next) => {
  console.log('404 - Route not found:', {
    method: req.method,
    path: req.path
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
    method: req.method
  });
  
  res.status(500).json({ 
    error: NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    stack: NODE_ENV !== 'production' ? err.stack : undefined
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log('Google Books API Key:', GOOGLE_BOOKS_API_KEY ? 'Present' : 'Missing');
  console.log(`CORS enabled for origin: http://localhost:3000`);
});

module.exports = app;