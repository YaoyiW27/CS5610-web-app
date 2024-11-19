// routes/bookComments.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const requireAuth = require('../middleware/requireAuth');

// Add a comment to a book
router.post('/:id/comment', requireAuth, async (req, res) => {
  const bookId = parseInt(req.params.id);
  const userId = req.userId;
  const { text } = req.body;

  try {
    const comment = await prisma.comment.create({
      data: {
        text,
        userId,
        bookId
      },
      include: {
        user: {
          select: {
            displayName: true
          }
        }
      }
    });

    res.json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get comments for a book (new endpoint)
router.get('/:id/comments', async (req, res) => {
  const bookId = parseInt(req.params.id);

  try {
    const comments = await prisma.comment.findMany({
      where: {
        bookId
      },
      include: {
        user: {
          select: {
            displayName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

module.exports = router;
