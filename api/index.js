import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3001;
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://cs5610-web-app.vercel.app'
    : 'http://localhost:3000',
  credentials: true 
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const { PrismaClient } = pkg;
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    },
  },
});

// Auth middleware
function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Please log in to continue" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);
    // Clear the invalid/expired token
    res.clearCookie("token");
    // Check if it's a token expiration error
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please log in again" });
    }
    return res.status(401).json({ error: "Invalid session. Please log in again" });
  }
}


// ===== Public Health Check Endpoints =====
app.get("/ping", (req, res) => {
  res.send("pong");
});


// ===== Authentication Endpoints =====
// Register
app.post("/register", async (req, res) => {
  const { email, password, displayName } = req.body;  
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        displayName   
      },
      select: { 
        id: true, 
        email: true, 
        displayName: true 
      },
    });

    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    res.cookie("token", token, { httpOnly: true, maxAge: 15 * 60 * 1000 });

    res.json(newUser);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
    res.cookie("token", token, { httpOnly: true, maxAge: 15 * 60 * 1000 });

    const userData = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };

    res.json(userData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// me
app.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, displayName: true },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});


// ===== Book Search Endpoints =====
// Get books by input query
app.get("/books/search/:query", async (req, res) => {
  try {
    const query = encodeURIComponent(req.params.query);

    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=20&key=${GOOGLE_BOOKS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Google Books API responded with ${response.status}`);
    }

    const data = await response.json();
    
    // Return Google Books API results directly, without querying the database
    res.json(data);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get book by googleBooksId
app.get("/books/:id", async (req, res) => {
  try {
    const googleBooksId = req.params.id;
    const userId = req.userId;

    let bookInDb = await prisma.book.findFirst({
      where: { googleBooksId },
      include: {
        userRatings: {
          where: userId ? { userId } : undefined,
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
        userFavorites: {
          include: {
            user: {
              select: {
                displayName: true,
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    let googleBookData;
    try {
      const googleResponse = await fetch(`https://www.googleapis.com/books/v1/volumes/${googleBooksId}`);
      if (!googleResponse.ok) {
        throw new Error(`Google Books API request failed with status: ${googleResponse.status}`);
      }
      googleBookData = await googleResponse.json();
    } catch (googleError) {
      console.error("Google Books API error:", googleError);
      if (!bookInDb) {
        return res.status(500).json({ error: "Failed to fetch book data from external API" });
      }
    }

    if (!bookInDb && googleBookData) {
      try {
        bookInDb = await prisma.book.create({
          data: {
            googleBooksId,
            name: googleBookData.volumeInfo.title,
            author: googleBookData.volumeInfo.authors?.[0] || "Unknown",
            description: googleBookData.volumeInfo.description || "",
            releasedDate: googleBookData.volumeInfo.publishedDate
              ? new Date(googleBookData.volumeInfo.publishedDate)
              : null,
            cover: googleBookData.volumeInfo.imageLinks?.thumbnail || null,
          },
          include: {
            userRatings: true,
            userFavorites: true,
            reviews: true,
          },
        });
      } catch (dbError) {
        console.error("Database creation error:", dbError);
        return res.status(500).json({ error: "Failed to create book in the database" });
      }
    }

    const stats = {
      averageRating:
        bookInDb.userRatings.length > 0
          ? bookInDb.userRatings.reduce((acc, curr) => acc + curr.score, 0) / bookInDb.userRatings.length
          : 0,
      favoriteCount: bookInDb.userFavorites.length,
      reviewCount: bookInDb.reviews.length,
    };

    const userRating = bookInDb.userRatings.find(
      rating => rating.userId === req.userId
    )?.score || null;

    res.json({
      id: bookInDb.googleBooksId,
      volumeInfo: googleBookData?.volumeInfo || {},
      dbData: {
        ...bookInDb,
        ...stats,
        userRating: userRating,
      },
    });
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ error: "Failed to fetch book details" });
  }
});


// ===== User Book Collections Endpoints =====
// User's favorited books
app.get("/books/user/favorites", requireAuth, async (req, res) => {
  try {
    console.log("Finding favorites for user:", req.userId);
    
    const favorites = await prisma.userFavoriteBook.findMany({
      where: { 
        userId: req.userId
      },
      include: { 
        book: true 
      }
    });

    const booksWithDetails = await Promise.all(favorites.map(async (fav) => {
      try {
        const googleResponse = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${fav.book.googleBooksId}`
        );
        
        const googleData = await googleResponse.json();
        
        return {
          id: fav.book.googleBooksId,
          volumeInfo: {
            title: fav.book.name,
            authors: [fav.book.author],
            publishedDate: fav.book.releasedDate,
            description: fav.book.description,
            imageLinks: {
              thumbnail: googleData.volumeInfo?.imageLinks?.thumbnail || null
            }
          },
          cover: googleData.volumeInfo?.imageLinks?.thumbnail || null
        };
      } catch (error) {
        console.error("Error fetching Google Books data:", error);
        return {
          id: fav.book.googleBooksId,
          volumeInfo: {
            title: fav.book.name,
            authors: [fav.book.author],
            publishedDate: fav.book.releasedDate,
            description: fav.book.description,
            imageLinks: { thumbnail: null }
          },
          cover: null
        };
      }
    }));

    res.json(booksWithDetails);
  } catch (error) {
    console.error("Server error in favorites:", error);
    res.status(500).json({ 
      error: "Failed to fetch favorites",
      details: error.message
    });
  }
});

// User's reviewed books
app.get("/books/user/reviews", requireAuth, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.userId },
      include: { book: true },
    });

    const formattedReviews = await Promise.all(reviews.map(async (review) => {
      const { book } = review;
      try {
        const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes/${book.googleBooksId}`;
        
        const googleResponse = await fetch(googleBooksUrl);
        const googleData = await googleResponse.json();
      

        const formatted = {
          id: book.googleBooksId,
          volumeInfo: {
            title: googleData.volumeInfo.title,
            authors: googleData.volumeInfo.authors,
            publishedDate: googleData.volumeInfo.publishedDate,
            description: googleData.volumeInfo.description,
            imageLinks: googleData.volumeInfo.imageLinks
          },
          cover: googleData.volumeInfo?.imageLinks?.thumbnail,
          review: {
            text: review.text,
            createdAt: review.createdAt
          }
        };
        
        return formatted;
      } catch (error) {
        console.error(`Error fetching Google Books data for ${book.googleBooksId}:`, error);
        return null;
      }
    }));

    const filteredReviews = formattedReviews.filter(review => review !== null);
    res.json(filteredReviews);
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ error: "Failed to fetch user reviews" });
  }
});

// User's rated books
app.get("/books/user/ratings", requireAuth, async (req, res) => {
  try {
    const ratings = await prisma.userRateBook.findMany({
      where: { userId: req.userId },
      include: { book: true },
    });

    const formattedRatings = await Promise.all(ratings.map(async (rating) => {
      const { book } = rating;
      try {
        const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes/${book.googleBooksId}`;
        const googleResponse = await fetch(googleBooksUrl);
        const googleData = await googleResponse.json();

        return {
          id: book.googleBooksId,
          volumeInfo: {
            title: googleData.volumeInfo.title,
            authors: googleData.volumeInfo.authors,
            publishedDate: googleData.volumeInfo.publishedDate,
            description: googleData.volumeInfo.description,
            imageLinks: googleData.volumeInfo.imageLinks
          },
          cover: googleData.volumeInfo?.imageLinks?.thumbnail,
          rating: {
            score: rating.score,
            createdAt: rating.createdAt
          }
        };
      } catch (error) {
        console.error(`Error fetching Google Books data for ${book.googleBooksId}:`, error);
        return null;
      }
    }));

    const filteredRatings = formattedRatings.filter(rating => rating !== null);
    res.json(filteredRatings);
  } catch (error) {
    console.error("Error fetching user ratings:", error);
    res.status(500).json({ error: "Failed to fetch user ratings" });
  }
});


// ===== Book Interaction Endpoints =====
// Post favorite
app.post("/books/:id/favorite", requireAuth, async (req, res) => {
  try {
    const googleBooksId = req.params.id;

    if (!googleBooksId) {
      return res.status(400).json({ error: "Invalid Book ID" });
    }

    let book = await prisma.book.findUnique({
      where: { googleBooksId },
    });

    if (!book) {
      book = await prisma.book.create({
        data: {
          googleBooksId,
          name: "", 
          author: "",
        },
      });
    }

    const existingFavorite = await prisma.userFavoriteBook.findUnique({
      where: {
        userId_bookId: {
          userId: req.userId,
          bookId: book.id,
        },
      },
    });

    if (existingFavorite) {
      return res.status(400).json({ error: "Book already in favorites" });
    }

    const favorite = await prisma.userFavoriteBook.create({
      data: {
        userId: req.userId,
        bookId: book.id,
      },
    });
    return res.json(favorite);
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// Delete favorite
app.delete("/books/:id/favorite", requireAuth, async (req, res) => {
  try {
    const googleBooksId = req.params.id;

    if (!googleBooksId) {
      return res.status(400).json({ error: "Invalid Book ID" });
    }

    const book = await prisma.book.findUnique({
      where: { googleBooksId },
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const existingFavorite = await prisma.userFavoriteBook.findUnique({
      where: {
        userId_bookId: {
          userId: req.userId,
          bookId: book.id,
        },
      },
    });

    if (!existingFavorite) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    await prisma.userFavoriteBook.delete({
      where: {
        userId_bookId: {
          userId: req.userId,
          bookId: book.id,
        },
      },
    });
    return res.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

// Post rate
app.post("/books/:id/rate", requireAuth, async (req, res) => {
  try {
    const googleBooksId = req.params.id;
    const { score } = req.body;

    if (!googleBooksId || typeof score !== "number" || score < 1 || score > 5) {
      return res.status(400).json({ error: "Invalid rating input" });
    }

    const book = await prisma.book.findUnique({
      where: { googleBooksId },
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const existingRating = await prisma.userRateBook.findFirst({
      where: { userId: req.userId, bookId: book.id },
    });

    if (existingRating) {
      const updatedRating = await prisma.userRateBook.update({
        where: { id: existingRating.id },
        data: { score, updatedAt: new Date() },
      });
      return res.json(updatedRating);
    } else {
      const rating = await prisma.userRateBook.create({
        data: {
          userId: req.userId,
          bookId: book.id,
          score,
        },
      });
      return res.json(rating);
    }
  } catch (error) {
    console.error("Error rating book:", error);
    res.status(500).json({ error: "Failed to rate book" });
  }
});

// Put rate
app.put("/books/:id/rate", requireAuth, async (req, res) => {
  try {
    const googleBooksId = req.params.id;
    const { score } = req.body;

    if (!googleBooksId || typeof score !== "number" || score < 1 || score > 5) {
      return res.status(400).json({ error: "Invalid rating input" });
    }

    const book = await prisma.book.findUnique({
      where: { googleBooksId },
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const existingRating = await prisma.userRateBook.findFirst({
      where: { userId: req.userId, bookId: book.id },
    });

    if (!existingRating) {
      return res.status(404).json({ error: "No existing rating found. Use POST to create." });
    }

    const updatedRating = await prisma.userRateBook.update({
      where: { id: existingRating.id },
      data: { score, updatedAt: new Date() },
    });

    res.json(updatedRating);
  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({ error: "Failed to update rating" });
  }
});

// Delete rate
app.delete("/books/:id/rate", requireAuth, async (req, res) => {
  try {
    const googleBooksId = req.params.id;
    const book = await prisma.book.findUnique({
      where: { googleBooksId },
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const existingRating = await prisma.userRateBook.findFirst({
      where: { userId: req.userId, bookId: book.id },
    });

    if (!existingRating) {
      return res.status(404).json({ error: "Rating not found" });
    }

    await prisma.userRateBook.delete({
      where: { id: existingRating.id },
    });

    res.json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({ error: "Failed to delete rating" });
  }
});

// Post review
app.post("/books/:id/review", requireAuth, async (req, res) => {
  try {
    const googleBooksId = req.params.id;
    const { text } = req.body;

    if (!googleBooksId || !text) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const book = await prisma.book.findUnique({
      where: { googleBooksId },
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Check if the user already reviewed the book
    const existingReview = await prisma.review.findFirst({
      where: { userId: req.userId, bookId: book.id },
    });

    if (existingReview) {
      // Update the existing review
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: { 
          text, 
          updatedAt: new Date() 
        },
      });
      return res.json(updatedReview);
    }

    // Create a new review if none exists
    const newReview = await prisma.review.create({
      data: {
        userId: req.userId,
        bookId: book.id,
        text,
        // updatedAt will be null by default for new reviews
      },
      include: {
        user: {
          select: {
            displayName: true
          }
        }
      }
    });

    res.json(newReview);
  } catch (error) {
    console.error("Error reviewing:", error);
    res.status(500).json({ error: "Failed to add review" });
  }
});

// Put review
app.put("/books/:id/review", requireAuth, async (req, res) => {
  try {
    const googleBooksId = req.params.id;
    const { text } = req.body;

    if (!googleBooksId || !text) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const book = await prisma.book.findUnique({
      where: { googleBooksId },
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Find the existing review
    const existingReview = await prisma.review.findFirst({
      where: { 
        userId: req.userId,
        bookId: book.id
      },
    });

    if (!existingReview) {
      return res.status(404).json({ error: "Review not found. Create a new review first." });
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: existingReview.id },
      data: {
        text,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            displayName: true
          }
        }
      }
    });

    res.json(updatedReview);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
});

// Delete review
app.delete("/books/:id/review", requireAuth, async (req, res) => {
  try {
    const googleBooksId = req.params.id;

    const book = await prisma.book.findUnique({
      where: { googleBooksId },
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const existingReview = await prisma.review.findFirst({
      where: { 
        userId: req.userId,
        bookId: book.id
      },
    });

    if (!existingReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    await prisma.review.delete({
      where: { id: existingReview.id },
    });

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

if (process.env.NODE_ENV === 'production') {
  // app.use(express.static(path.join(__dirname, '../client/build')));
  // app.get('*', (req, res) => {
  //   res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  // });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🎉 🚀`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("Google Books API Key:", GOOGLE_BOOKS_API_KEY ? "Present" : "Missing");
});
