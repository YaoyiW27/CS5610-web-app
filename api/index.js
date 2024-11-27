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
    console.log("Finding favorites for user:", req.userId);
    
    const favorites = await prisma.userFavoriteBook.findMany({
      where: { 
        userId: req.userId
      },
      include: { 
        book: true 
      }
    });

    console.log("Found favorites:", favorites);

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

app.get("/books/:id", async (req, res) => {
  try {
    const googleBooksId = req.params.id;
    const userId = req.userId;

    // Step 1: Check if the book already exists in the database
    let bookInDb = await prisma.book.findFirst({
      where: { googleBooksId },
      include: {
        userRatings: {
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

    // Step 2: Fetch book data from Google Books API if not found in the database
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
        // If the book doesn't exist in DB and Google API fails, return an error
        return res.status(500).json({ error: "Failed to fetch book data from external API" });
      }
    }

    // Step 3: Create the book in the database if not already present
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

    // Step 4: Calculate book statistics
    const stats = {
      averageRating:
        bookInDb.userRatings.length > 0
          ? bookInDb.userRatings.reduce((acc, curr) => acc + curr.score, 0) / bookInDb.userRatings.length
          : 0,
      favoriteCount: bookInDb.userFavorites.length,
      reviewCount: bookInDb.reviews.length,
    };

    // Step 5: Respond with combined data
    res.json({
      id: bookInDb.googleBooksId,
      volumeInfo: googleBookData?.volumeInfo || {}, // Include Google Book data if available
      dbData: {
        ...bookInDb,
        ...stats,
        userFavorite: userId
          ? !!bookInDb.userFavorites.find((fav) => fav.userId === userId)
          : false,
        userRating: userId
          ? bookInDb.userRatings.find((rating) => rating.userId === userId)?.score || null
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ error: "Failed to fetch book details" });
  }
});

// Protected book endpoints
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
      await prisma.userFavoriteBook.delete({
        where: {
          userId_bookId: {
            userId: req.userId,
            bookId: book.id,
          },
        },
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
      data: { score, ratedAt: new Date() },
    });

    res.json(updatedRating);
  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({ error: "Failed to update rating" });
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🎉 🚀`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("Google Books API Key:", GOOGLE_BOOKS_API_KEY ? "Present" : "Missing");
});