const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 获取所有项目
router.get('/', async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

const requireAuth = require('../middleware/requireAuth');

// 插入一个项目（需要身份验证）
router.post('/', requireAuth, async (req, res) => {
  const { name } = req.body;
  const userId = req.userId;

  try {
    const item = await prisma.item.create({
      data: {
        name,
        userId,
      },
    });
    res.json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

module.exports = router;