import React, { useState, useEffect } from 'react';
import { useAuthUser } from '../security/AuthContext';
import RatedReviewedBookList from '../components/RatedReviewedBookList';
import LikedBookList from '../components/LikedBookList';
import '../style/MyBooks.css';

function MyBooks() {
  const [activeTab, setActiveTab] = useState('favorites');
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [ratedReviewedBooks, setRatedReviewedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuthUser();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    let isMounted = true;

    const fetchUserBooks = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const [favResponse, reviewResponse, ratingResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/books/user/favorites`, { credentials: "include" }),
          fetch(`${API_BASE_URL}/books/user/reviews`, { credentials: "include" }),
          fetch(`${API_BASE_URL}/books/user/ratings`, { credentials: "include" })
        ]);

        if (!favResponse.ok) {
          throw new Error(`Failed to fetch favorites: ${favResponse.statusText}`);
        }
        if (!reviewResponse.ok) {
          throw new Error(`Failed to fetch reviews: ${reviewResponse.statusText}`);
        }
        if (!ratingResponse.ok) {
          throw new Error(`Failed to fetch ratings: ${ratingResponse.statusText}`);
        }

        const favorites = await favResponse.json();
        const reviews = await reviewResponse.json();
        const ratings = await ratingResponse.json();

        const reviewsWithRatings = reviews.map(review => {
          const rating = ratings.find(r => r.id === review.id);
          return {
            ...review,
            rating: rating ? rating.rating : { score: 0 }
          };
        });

        if (isMounted) {
          setFavoriteBooks(favorites);
          setRatedReviewedBooks(reviewsWithRatings);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchUserBooks();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, API_BASE_URL]);

  const handleDeleteReview = (bookId) => {
    setRatedReviewedBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
  };

  const handleDeleteFavorite = (bookId) => {
    setFavoriteBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
  };

  if (!isAuthenticated) {
    return <div className="main-container my-books-page">Please login to view your books.</div>;
  }

  if (loading) return <div className="loading">Loading your books...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="main-container my-books-page">
      <div className="content-area">
        <h1>My Books</h1>
        <div className="my-books-tabs">
          <div className="tabs-header">
            <button
              className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              Favorites ({favoriteBooks?.length || 0})
            </button>
            <button
              className={`tab-button ${activeTab === 'rated-reviewed' ? 'active' : ''}`}
              onClick={() => setActiveTab('rated-reviewed')}
            >
              Ratings & Reviews ({ratedReviewedBooks?.length || 0})
            </button>
          </div>
  
          <div className="tabs-content">
            {activeTab === 'favorites' ? (
              favoriteBooks?.length > 0 ? (
                <LikedBookList 
                  books={favoriteBooks} 
                  onDeleteFavorite={handleDeleteFavorite}
                />
              ) : (
                <div className="empty-state">No favorite books yet</div>
              )
            ) : (
              ratedReviewedBooks?.length > 0 ? (
                <RatedReviewedBookList 
                  books={ratedReviewedBooks} 
                  onDeleteReview={handleDeleteReview}
                />
              ) : (
                <div className="empty-state">No rated & reviewed books yet</div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyBooks;
