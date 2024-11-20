const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const requireAuth = require('../middleware/requireAuth');


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
      averageRating: book.userRatings.length > 0
        ? book.userRatings.reduce((acc, curr) => acc + curr.score, 0) / book.userRatings.length
        : 0
    }));

    res.json(booksWithStats);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get a single book with details (using Google Books API)
router.get('/:id', async (req, res) => {
  try {
    const googleBooksId = req.params.id;
    console.log('Fetching book details for ID:', googleBooksId);

    let bookInDb = await prisma.book.findFirst({
      where: {
        googleBooksId: googleBooksId
      },
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
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    // Using native fetch
    const googleBooksResponse = await fetch(`https://www.googleapis.com/books/v1/volumes/${googleBooksId}`);
    if (!googleBooksResponse.ok) {
      throw new Error('Google Books API request failed');
    }
    const googleBookData = await googleBooksResponse.json();

    if (!bookInDb) {
      bookInDb = await prisma.book.create({
        data: {
          googleBooksId: googleBooksId,
          name: googleBookData.volumeInfo.title,
          author: googleBookData.volumeInfo.authors ? googleBookData.volumeInfo.authors[0] : 'Unknown',
          overview: googleBookData.volumeInfo.description || '',
          releasedDate: googleBookData.volumeInfo.publishedDate ? new Date(googleBookData.volumeInfo.publishedDate) : null
        },
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
      console.log('Created new book record:', bookInDb.id);
    }

    // Calculate statistics
    const stats = {
      averageRating: bookInDb.userRatings.length > 0
        ? bookInDb.userRatings.reduce((acc, curr) => acc + curr.score, 0) / bookInDb.userRatings.length
        : 0,
      favoriteCount: bookInDb.userFavorites.length,
      commentCount: bookInDb.comments.length
    };

    const response = {
      ...googleBookData,
      dbData: {
        id: bookInDb.id,
        userRatings: bookInDb.userRatings,
        userFavorites: bookInDb.userFavorites,
        comments: bookInDb.comments,
        ...stats
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ 
      error: 'Failed to fetch book details',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's favorite books
router.get('/user/favorites', requireAuth, async (req, res) => {
  try {
    const favorites = await prisma.userFavoriteBook.findMany({
      where: {
        userId: req.userId,
        unlikedAt: null
      },
      include: {
        book: true
      }
    });

    const books = favorites.map(fav => fav.book);
    res.json(books);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Get user's commented books
router.get('/user/comments', requireAuth, async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        userId: req.userId
      },
      include: {
        book: true
      },
      distinct: ['bookId'],
      orderBy: {
        createdAt: 'desc'
      }
    });

    const books = comments.map(comment => comment.book);
    res.json(books);
  } catch (error) {
    console.error('Error fetching commented books:', error);
    res.status(500).json({ error: 'Failed to fetch commented books' });
  }
});

// Search books (using Google Books API)
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error('Google Books API search request failed');
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ error: 'Failed to search books' });
  }
});

module.exports = router;