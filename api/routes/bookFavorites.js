// routes/bookFavorites.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const requireAuth = require('../middleware/requireAuth');

// Add or remove book from favorites
router.post('/:id/favorite', requireAuth, async (req, res) => {
  const googleBooksId = req.params.id;
  const userId = req.userId;
  const book = await prisma.book.findUnique({
    where: {
      googleBooksId
    }
  });
  const bookId = book.id;
  try {
    const existingFavorite = await prisma.userFavoriteBook.findFirst({
      where: {
        userId,
        bookId,
        unlikedAt: null
      }
    });
    if (existingFavorite) {
      // Remove from favorites
      await prisma.userFavoriteBook.update({
        where: { id: existingFavorite.id },
        data: { unlikedAt: new Date() }
      });
      res.json({ message: 'Book removed from favorites' });
    } else {
      // Add to favorites
      console.log({
        data: {
          userId,
          bookId
        }
      })
      await prisma.userFavoriteBook.create({
        data: {
          userId,
          bookId
        }
      });
      res.json({ message: 'Book added to favorites' });
    }
  } catch (error) {
    console.error('Error updating favorites:', error);
    res.status(500).json({ error: 'Failed to update favorites' });
  }
});

module.exports = router;
