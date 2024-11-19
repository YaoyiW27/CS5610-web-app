import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import '../style/BookDetailPage.css';

function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [communityReviews, setCommunityReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      try {
        // Fetch book details
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch book details');
        }
        const data = await response.json();
        setBook(data);

        // Check if book is in favorites
        try {
          const favoritesResponse = await fetch('http://localhost:3001/api/books/user/favorites', {
            credentials: 'include'
          });
          if (favoritesResponse.ok) {
            const favorites = await favoritesResponse.json();
            setIsFavorite(favorites.some(fav => fav.id === parseInt(id)));
          }
        } catch (favError) {
          console.error('Error fetching favorites:', favError);
        }

        // Fetch reviews
        try {
          const reviewsResponse = await fetch(`http://localhost:3001/api/books/${id}/comments`, {
            credentials: 'include'
          });
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            setCommunityReviews(reviewsData);
          }
        } catch (reviewError) {
          console.error('Error fetching reviews:', reviewError);
          setCommunityReviews([]);
        }
      } catch (error) {
        console.error('Error fetching book:', error);
        setError('Failed to load book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const handleFavoriteClick = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/books/${id}/favorite`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to update favorite status');

      const result = await response.json();
      setIsFavorite(!isFavorite);
      alert(result.message);
    } catch (error) {
      console.error('Error updating favorite status:', error);
      alert('Failed to update favorite status. Please make sure you are logged in.');
    }
  };

  const handleStarClick = (rating) => {
    setUserRating(rating);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!userReview.trim()) {
      alert('Please write a review before submitting.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/books/comment/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          text: userReview,
          title: book.volumeInfo.title,
          authors: book.volumeInfo.authors,
          description: book.volumeInfo.description,
          publishedDate: book.volumeInfo.publishedDate
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      setUserRating(0);
      setUserReview('');
      
      const reviewsResponse = await fetch(`http://localhost:3001/api/books/${id}/comments`, {
        credentials: 'include'
      });
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setCommunityReviews(reviewsData);
      }
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please make sure you are logged in and try again.');
    }
  };

  if (loading) {
    return (
      <div className="book-detail-page">
        <div className="loading">Loading book details...</div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="book-detail-page">
        <div className="error">
          {error || 'Book not found. Please check the URL and try again.'}
        </div>
      </div>
    );
  }

  const {
    title = 'No title available',
    authors = ['Unknown author'],
    description = 'No description available',
    imageLinks = {},
    publishedDate,
    publisher,
    pageCount,
    categories
  } = book.volumeInfo;

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
            {communityReviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="reviews-list">
                {communityReviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <span className="reviewer-name">{review.user?.displayName || 'Anonymous'}</span>
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
