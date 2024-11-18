// api/index.js

const express = require('express');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');
const { requireAuth } = require('./middleware/auth');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cookieParser());

// 测试端点
app.get('/api/ping', (req, res) => {
  res.json({ message: 'API is working!' });
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/books', requireAuth, booksRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});