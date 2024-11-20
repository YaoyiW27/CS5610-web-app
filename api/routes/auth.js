const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Test route for bcrypt functionality
router.post('/test-password', async (req, res) => {
  try {
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const match = await bcrypt.compare(password, hashedPassword);
    
    res.json({
      originalPassword: password,
      hashedPassword: hashedPassword,
      matches: match
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    console.log('Register attempt:', { email, displayName });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('Registration failed: User already exists');
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password with a specific salt round
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName
      }
    });

    console.log('User created successfully:', user.id);

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('JWT token created');

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return user data (excluding password)
    const { password: _, ...userData } = user;
    res.status(201).json(userData);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

// Login endpoint with detailed logging
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    console.log('User lookup result:', user ? 'User found' : 'User not found');

    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    console.log('Attempting password verification...');
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password verification result:', validPassword ? 'Valid' : 'Invalid');

    if (!validPassword) {
      console.log('Login failed: Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('JWT token created successfully');

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    console.log('Cookie set successfully');
    console.log('Login successful for user:', user.id);

    // Return user data (excluding password)
    const { password: _, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

// Check authentication status
router.get('/check', (req, res) => {
  const token = req.cookies.token;
  console.log('Auth check - Token present:', !!token);

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth check - Token valid for user:', decoded.userId);
    res.json({ authenticated: true, userId: decoded.userId });
  } catch (error) {
    console.error('Auth check - Token invalid:', error.message);
    res.status(401).json({ authenticated: false });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  console.log('Logout request received');
  res.clearCookie('token');
  console.log('Token cookie cleared');
  res.json({ message: 'Logged out successfully' });
});

// Test route to check user's hashed password in database
router.get('/check-password/:email', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.params.email },
      select: { password: true }
    });
    
    if (!user) {
      return res.json({ message: 'User not found' });
    }

    res.json({
      hashedPassword: user.password,
      hashType: user.password.startsWith('$2a$') ? 'bcrypt' : 'unknown'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
