const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const app = express();

// Load environment variables
require('dotenv').config();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const bookRatingsRoutes = require('./routes/bookRatings');
const bookFavoritesRoutes = require('./routes/bookFavorites');
const bookCommentsRoutes = require('./routes/bookComments');

// Route middleware
app.use('/api/auth', authRoutes);

// Books and related features routes
// All book-related routes share the same base path '/api/books'
// The specific route handlers in each file will handle their specific endpoints
app.use('/api/books', bookRoutes);          // Core book operations (GET /, GET /:id)
app.use('/api/books', bookRatingsRoutes);   // Rating operations (POST /:id/rate, GET /:id/ratings)
app.use('/api/books', bookFavoritesRoutes); // Favorite operations (POST /:id/favorite, GET /user/favorites)
app.use('/api/books', bookCommentsRoutes);  // Comment operations (POST /:id/comment, GET /:id/comments)

// Global error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle specific types of errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized access' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  // Default error response
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Something broke!' 
      : err.message 
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
