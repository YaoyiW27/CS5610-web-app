import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthUser } from '../security/AuthContext';
import DOMPurify from 'dompurify';
import '../style/BookDetailPage.css';

function BookDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthUser();
  const [book, setBook] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

  const fetchBookDetails = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch book details');
      }
      const bookData = await response.json();
      setBook(bookData);
      setIsFavorite(bookData.dbData.userFavorites?.length > 0);
      if (bookData.dbData.userRatings?.length > 0) {
        setUserRating(bookData.dbData.userRatings[0].score);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, API_BASE_URL]);

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      alert('You must be logged in to add/remove favorites.');  
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}/favorite`, {
        method: 'POST',
        credentials: 'include', 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add/remove favorite');
      }
      const data = await response.json();
      console.log('Favorite response:', data);
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleStarClick = async (rating) => {
    if (!isAuthenticated) {
      alert('您必须登录才能评分。');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}/rate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: rating })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to rate the book');
      }
      const data = await response.json();
      console.log('Rating response:', data);
      setUserRating(rating);
      fetchBookDetails();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !userReview.trim()) {
      alert('You must be logged in and enter a review to submit.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}/review`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userReview }) 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }
      const data = await response.json();

      setUserReview(''); 
      fetchBookDetails(); 
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!book) return <div>Book not found</div>;

  const sanitizedDescription = DOMPurify.sanitize(book.volumeInfo?.description || '');

  return (
    <div className="book-detail-page">
      {book && (
        <>
          <h1>{book.volumeInfo.title}</h1>
          <div className="favorite-section">
            <button onClick={handleFavoriteClick}>
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorite'}
            </button>
          </div>
          <div className="rating-section">
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} onClick={() => handleStarClick(star)} style={{ cursor: 'pointer', fontSize: '24px', color: star <= userRating ? '#FFD700' : '#CCCCCC' }}>
                {star <= userRating ? '★' : '☆'}
              </span>
            ))}
          </div>
          <div 
            className="description"
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
          <form onSubmit={handleReviewSubmit}>
            <textarea
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              placeholder="Enter your review here..."
              required
            />
            <button type="submit">Submit Review</button>
          </form>
        </>
      )}
    </div>
  );
}

export default BookDetailPage;