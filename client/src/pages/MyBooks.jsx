import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookList from '../components/BookList';

const MyBooks = () => {
  const [activeTab, setActiveTab] = useState('favorites');
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [commentedBooks, setCommentedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserBooks();
  }, []);

  const fetchUserBooks = async () => {
    setLoading(true);
    try {
      // Fetch favorite books
      const favResponse = await fetch('http://localhost:3001/api/books/user/favorites', {
        credentials: 'include'
      });
      if (!favResponse.ok) throw new Error('Failed to fetch favorites');
      const favorites = await favResponse.json();
      setFavoriteBooks(favorites);

      // Fetch books with user's comments
      const commentResponse = await fetch('http://localhost:3001/api/books/user/comments', {
        credentials: 'include'
      });
      if (!commentResponse.ok) throw new Error('Failed to fetch commented books');
      const commented = await commentResponse.json();
      setCommentedBooks(commented);

    } catch (error) {
      console.error('Error fetching user books:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your books...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

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
              Favorite Books ({favoriteBooks.length})
            </button>
            <button
              className={`tab-button ${activeTab === 'commented' ? 'active' : ''}`}
              onClick={() => setActiveTab('commented')}
            >
              Commented Books ({commentedBooks.length})
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === 'favorites' && (
              <div className="tab-pane">
                {favoriteBooks.length === 0 ? (
                  <p>No favorite books yet.</p>
                ) : (
                  <BookList books={favoriteBooks} />
                )}
              </div>
            )}
            {activeTab === 'commented' && (
              <div className="tab-pane">
                {commentedBooks.length === 0 ? (
                  <p>No commented books yet.</p>
                ) : (
                  <BookList books={commentedBooks} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBooks;
