import React, { useState, useEffect } from 'react';
import BookList from '../components/BookList';
import { useAuthUser } from '../security/AuthContext';

function MyBooks() {
  const [activeTab, setActiveTab] = useState('favorites');
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [reviewedBooks, setReviewedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuthUser();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    async function fetchUserBooks() {
      console.log("Fetching user books...");
  
      try {
        const favResponse = await fetch(`${API_BASE_URL}/user/favorites`, { credentials: "include" });
        const reviewResponse = await fetch(`${API_BASE_URL}/books/user/reviews`, { credentials: "include" });
  
        if (favResponse.ok) {
          const favorites = await favResponse.json();
          console.log("Fetched favorites:", favorites);
          setFavoriteBooks(favorites);
        } else {
          console.error("Failed to fetch favorites.");
        }
  
        if (reviewResponse.ok) {
          const reviews = await reviewResponse.json();
          console.log("Fetched reviews:", reviews);
          setReviewedBooks(reviews);
        } else {
          console.error("Failed to fetch reviews.");
        }

        if (!favResponse.ok && !reviewResponse.ok) {
          throw new Error("Failed to fetch user books");
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  
    fetchUserBooks();
  }, [isAuthenticated, API_BASE_URL]);

  if (loading) return <div className="loading">Loading your books...</div>;
  if (error) return <div className="error">Error: {error}</div>;

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
              Favorites ({favoriteBooks.length})
            </button>
            <button
              className={`tab-button ${activeTab === 'reviewed' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviewed')}
            >
              Reviews ({reviewedBooks.length})
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === 'favorites' && (
              <BookList books={favoriteBooks} />
            )}
            {activeTab === 'reviewed' && (
              <BookList books={reviewedBooks} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyBooks;