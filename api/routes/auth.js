const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

// 注册端点
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 登录端点
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 查找用户
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 创建 JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // 设置 Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
    });

    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 登出端点
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
});

// 检查身份验证状态
router.get('/check', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ authenticated: true });
  } catch (error) {
    res.status(401).json({ authenticated: false });
  }
});

module.exports = router;