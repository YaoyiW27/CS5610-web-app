import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import { useAuth } from '../hooks/useAuth';
import DOMPurify from 'dompurify';
import '../style/BookDetailPage.css';

function BookDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { 
    loading: bookLoading,
    error: bookError,
    toggleFavorite,
    addRating,
    updateRating,
    addComment,
    getBookDetails
  } = useBooks();

  const [book, setBook] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const bookData = await getBookDetails(id);
      setBook(bookData);
      // Check if user has rated the book
      if (bookData.userRatings && bookData.userRatings.length > 0) {
        setUserRating(bookData.userRatings[0].score);
      }
      // Check if book is favorited
      setIsFavorite(bookData.userFavorites && bookData.userFavorites.length > 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      alert('Please log in to favorite books');
      return;
    }
    try {
      await toggleFavorite(id);
      setIsFavorite(!isFavorite);
    } catch (err) {
      alert('Failed to update favorite status');
    }
  };

  const handleStarClick = async (rating) => {
    if (!isAuthenticated) {
      alert('Please log in to rate books');
      return;
    }
    try {
      if (userRating === 0) {
        await addRating(id, rating);
      } else {
        await updateRating(id, rating);
      }
      setUserRating(rating);
      fetchBookDetails(); // Refresh book details to update average rating
    } catch (err) {
      alert('Failed to update rating');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please log in to review books');
      return;
    }
    if (!userReview.trim()) {
      alert('Please write a review before submitting.');
      return;
    }
    try {
      await addComment(id, userReview);
      setUserReview('');
      fetchBookDetails(); // Refresh book details to show new comment
    } catch (err) {
      alert('Failed to submit review');
    }
  };

  if (loading || bookLoading) {
    return <div className="loading">Loading book details...</div>;
  }

  if (error || bookError || !book) {
    return <div className="error">{error || bookError || 'Book not found'}</div>;
  }

  const {
    volumeInfo = {},
    userRatings = [],
    userFavorites = [],
    comments = []
  } = book;

  const {
    title = 'No title available',
    authors = ['Unknown author'],
    description = 'No description available',
    imageLinks = {},
    publishedDate,
    publisher,
    pageCount,
    categories
  } = volumeInfo;

  const sanitizedDescription = DOMPurify.sanitize(description);

  return (
    <div className="book-detail-page">
      <div className="book-detail-container">
        <div className="left-column">
          <img
            src={imageLinks.thumbnail || '/placeholder-book.png'}
            alt={title}
            className="book-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-book.png';
            }}
          />
          <button
            onClick={handleFavoriteClick}
            className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
          >
            <span className="favorite-icon">{isFavorite ? '♥' : '♡'}</span>
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
          <div className="book-metadata">
            {publishedDate && <p><strong>Published:</strong> {publishedDate}</p>}
            {publisher && <p><strong>Publisher:</strong> {publisher}</p>}
            {pageCount && <p><strong>Pages:</strong> {pageCount}</p>}
            {categories && categories.length > 0 && (
              <p><strong>Categories:</strong> {categories.join(', ')}</p>
            )}
          </div>
        </div>

        <div className="right-column">
          <h1 className="book-title">{title}</h1>
          <h3 className="book-authors">by {Array.isArray(authors) ? authors.join(', ') : authors}</h3>
          
          <div
            className="book-description"
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />

          <div className="ratings-reviews">
            <h2>Add Your Review</h2>
            <div className="user-rating">
              <p>Your Rating:</p>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${userRating >= star ? 'filled' : ''}`}
                    onClick={() => handleStarClick(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="review-form">
              <textarea
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                placeholder="Write your review..."
                className="review-textarea"
                required
              />
              <button type="submit" className="submit-review-button">
                Submit Review
              </button>
            </form>
          </div>

          <div className="community-reviews">
            <h2>Community Reviews</h2>
            {comments.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="reviews-list">
                {comments.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <span className="reviewer-name">
                        {review.user?.displayName || 'Anonymous'}
                      </span>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="review-text">{review.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;
