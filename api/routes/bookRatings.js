// routes/bookRatings.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const requireAuth = require('../middleware/requireAuth');

// Rate a book
router.post('/:id/rate', requireAuth, async (req, res) => {
  const googleBooksId = req.params.id;
  const userId = req.userId;
  const { score } = req.body;
  const book = await prisma.book.findUnique({
    where: {
      googleBooksId
    }
  });
  const bookId = book.id;
  try {
    const rating = await prisma.userRateBook.create({
      data: {
        userId,
        bookId,
        score
      }
    });

    // Update book's average rating
    const ratings = await prisma.userRateBook.findMany({
      where: { bookId }
    });

    const avgRating = ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length;

    await prisma.book.update({
      where: { id: bookId },
      data: { ratedAverage: avgRating }
    });

    res.json(rating);
  } catch (error) {
    console.error('Error rating book:', error);
    res.status(500).json({ error: 'Failed to rate book' });
  }
});

// Get all ratings for a book
router.get('/:id/ratings', async (req, res) => {
  const bookId = parseInt(req.params.id);

  try {
    const ratings = await prisma.userRateBook.findMany({
      where: { bookId },
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

    res.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

// Get user's ratings
router.get('/user/ratings', requireAuth, async (req, res) => {
  try {
    const ratings = await prisma.userRateBook.findMany({
      where: {
        userId: req.userId
      },
      include: {
        book: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(ratings);
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    res.status(500).json({ error: 'Failed to fetch user ratings' });
  }
});

// Update a rating
router.put('/:id/rate', requireAuth, async (req, res) => {
  const googleBooksId = req.params.id;
  const userId = req.userId;
  const { score } = req.body;
  const book = await prisma.book.findUnique({
    where: {
      googleBooksId
    }
  });
  const bookId = book.id;
  

  try {
    const existingRating = await prisma.userRateBook.findFirst({
      where: {
        bookId,
        userId
      }
    });

    if (!existingRating) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    const rating = await prisma.userRateBook.update({
      where: {
        id: existingRating.id
      },
      data: {
        score
      }
    });

    // Update book's average rating
    const ratings = await prisma.userRateBook.findMany({
      where: { bookId }
    });

    const avgRating = ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length;

    await prisma.book.update({
      where: { id: bookId },
      data: { ratedAverage: avgRating }
    });

    res.json(rating);
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({ error: 'Failed to update rating' });
  }
});

module.exports = router;
