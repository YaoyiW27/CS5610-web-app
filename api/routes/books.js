// routes/books.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all books with their average ratings
router.get('/', async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      include: {
        userRatings: true,
        userFavorites: {
          where: {
            unlikedAt: null
          }
        },
        comments: {
          include: {
            user: {
              select: {
                displayName: true
              }
            }
          }
        }
      }
    });

    const booksWithStats = books.map(book => ({
      ...book,
      favoriteCount: book.userFavorites.length,
      commentCount: book.comments.length,
      averageRating: book.userRatings.reduce((acc, curr) => acc + curr.score, 0) / book.userRatings.length || 0
    }));

    res.json(booksWithStats);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get a single book with details
router.get('/:id', async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        userRatings: {
          include: {
            user: {
              select: {
                displayName: true
              }
            }
          }
        },
        userFavorites: {
          where: {
            unlikedAt: null
          },
          include: {
            user: {
              select: {
                displayName: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                displayName: true
              }
            }
          }
        }
      }
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

module.exports = router;
