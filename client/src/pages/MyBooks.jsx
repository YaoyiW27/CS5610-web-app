import React, { useState, useEffect } from 'react';
import BookList from '../components/BookList';
import { useAuthUser } from '../security/AuthContext';
import ReviewedBookList from '../components/ReviewedBookList';
import '../style/MyBooks.css';

function MyBooks() {
  const [activeTab, setActiveTab] = useState('favorites');
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [reviewedBooks, setReviewedBooks] = useState([]);
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
        const [favResponse, reviewResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/user/favorites`, { credentials: "include" }),
          fetch(`${API_BASE_URL}/books/user/reviews`, { credentials: "include" })
        ]);

        if (!favResponse.ok) {
          throw new Error(`Failed to fetch favorites: ${favResponse.statusText}`);
        }
        if (!reviewResponse.ok) {
          throw new Error(`Failed to fetch reviews: ${reviewResponse.statusText}`);
        }

        const favorites = await favResponse.json();
        const reviews = await reviewResponse.json();

        if (isMounted) {
          setFavoriteBooks(favorites);
          setReviewedBooks(reviews);
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
    setReviewedBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
  };

  if (!isAuthenticated) {
    return <div className="main-container">Please login to view your books.</div>;
  }

  if (loading) return <div className="loading">Loading your books...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="main-container">
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
              className={`tab-button ${activeTab === 'reviewed' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviewed')}
            >
              Reviews ({reviewedBooks?.length || 0})
            </button>
          </div>
  
          <div className="tabs-content">
            {activeTab === 'favorites' ? (
              favoriteBooks?.length > 0 ? (
                <div className="favorites-grid">
                  <BookList books={favoriteBooks} />
                </div>
              ) : (
                <div className="empty-state">No favorite books yet</div>
              )
            ) : (
              reviewedBooks?.length > 0 ? (
                <div className="reviewed-books-list">
                  <ReviewedBookList 
                    books={reviewedBooks} 
                    onDeleteReview={handleDeleteReview}
                  />
                </div>
              ) : (
                <div className="empty-state">No reviewed books yet</div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyBooks;