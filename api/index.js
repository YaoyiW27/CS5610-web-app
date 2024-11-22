import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";

const app = express();
const PORT = process.env.PORT || 3001;
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Auth middleware
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  console.log("Token:", token); 
  if (!token) {
    return res.status(401).json({ error: "Unauthorized - Missing Token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    console.log("Authenticated User ID:", req.userId); 
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);
    return res.status(401).json({ error: "Unauthorized - Invalid Token" });
  }
}

// Public endpoints
app.get("/ping", (req, res) => {
  res.send("pong");
});

// Auth endpoints
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

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

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

// Book endpoints
app.get("/books/search/:query", async (req, res) => {
  try {
    const query = encodeURIComponent(req.params.query);
    console.log("Searching for:", query); 

    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=20&key=${GOOGLE_BOOKS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Google Books API responded with ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: err.message });
  }
});

// User's books endpoints
app.get("/user/favorites", requireAuth, async (req, res) => {
  try {
    const favorites = await prisma.userFavoriteBook.findMany({
      where: { userId: req.userId, unlikedAt: null },
      include: { book: true }
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
        console.error(`Error fetching Google Books data for ${fav.book.googleBooksId}:`, error);

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
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

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

app.get("/books/:id", requireAuth, async (req, res) => {
  try {
    const googleBooksId = req.params.id;

    let bookInDb = await prisma.book.findFirst({
      where: { googleBooksId },
      include: {
        userRatings: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true
              }
            }
          }
        },
        userFavorites: {
          where: { unlikedAt: null },
          include: {
            user: {
              select: {
                displayName: true
              }
            }
          }
        },
        reviews: { 
          include: {
            user: {
              select: {
                id: true,
                displayName: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    const googleResponse = await fetch(`https://www.googleapis.com/books/v1/volumes/${googleBooksId}`);
    if (!googleResponse.ok) {
      throw new Error('Google Books API request failed');
    }
    const googleBookData = await googleResponse.json();
    
    if (!bookInDb) {
      bookInDb = await prisma.book.create({
        data: {
          googleBooksId,
          name: googleBookData.volumeInfo.title,
          author: googleBookData.volumeInfo.authors?.[0] || 'Unknown',
          description: googleBookData.volumeInfo.description || '',
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
    }

    const stats = {
      averageRating: bookInDb.userRatings.length > 0
        ? bookInDb.userRatings.reduce((acc, curr) => acc + curr.score, 0) / bookInDb.userRatings.length
        : 0,
      favoriteCount: bookInDb.userFavorites.length,
      reviewCount: bookInDb.reviews.length
    };

    res.json({
      id: bookInDb.googleBooksId,
      ...googleBookData,
      dbData: {
        ...bookInDb,
        ...stats
      }
    });
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

// Protected book endpoints
app.post("/books/:id/favorite", requireAuth, async (req, res) => {
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

    const existingFavorite = await prisma.userFavoriteBook.findFirst({
      where: { userId: req.userId, bookId: book.id, unlikedAt: null },
    });

    if (existingFavorite) {
      await prisma.userFavoriteBook.update({
        where: { id: existingFavorite.id },
        data: { unlikedAt: new Date() },
      });
      return res.json({ message: "Removed from favorites" });
    } else {
      const favorite = await prisma.userFavoriteBook.create({
        data: {
          userId: req.userId,
          bookId: book.id,
        },
      });
      return res.json(favorite);
    }
  } catch (error) {
    console.error("Error favoriting book:", error);
    res.status(500).json({ error: "Failed to favorite book" });
  }
});

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
      where: { userId: req.userId, bookId: book.id, unratedAt: null },
    });

    if (existingRating) {
      const updatedRating = await prisma.userRateBook.update({
        where: { id: existingRating.id },
        data: { score, ratedAt: new Date() },
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
        data: { text, updatedAt: new Date() },
      });
      return res.json(updatedReview);
    }

    // Create a new review if none exists
    const newReview = await prisma.review.create({
      data: {
        userId: req.userId,
        bookId: book.id,
        text,
      },
    });

    res.json(newReview);
  } catch (error) {
    console.error("Error reviewing:", error);
    res.status(500).json({ error: "Failed to add review" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🎉 🚀`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("Google Books API Key:", GOOGLE_BOOKS_API_KEY ? "Present" : "Missing");
});