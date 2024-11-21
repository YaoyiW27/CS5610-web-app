const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const requireAuth = require('../middleware/requireAuth');

// Get comments for a specific book
router.get('/:id/comments', async (req, res) => {
  const book = await prisma.book.findUnique({
    where: {
      googleBooksId
    }
  });
  const bookId = book.id;

  try {
    const comments = await prisma.comment.findMany({
      where: {
        bookId: bookId
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


// Add a comment to a book
router.post('/:id/comment', requireAuth, async (req, res) => {
  const googleBooksId = req.params.id;
  const userId = req.userId;
  const { text } = req.body;

  console.log('userId =>>', userId);
  console.log('bookId =>>', googleBooksId);

  const book = await prisma.book.findUnique({
    where: {
      googleBooksId
    }
  });

  try {
    const comment = await prisma.comment.create({
      data: {
        text,
        userId,
        bookId: book.id,
      },
      // include: {
      //   user: {
      //     select: {
      //       displayName: true
      //     }
      //   }
      // }
    });

    res.json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

module.exports = router;
