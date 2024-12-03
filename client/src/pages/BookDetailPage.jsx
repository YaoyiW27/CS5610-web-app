import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuthUser } from "../security/AuthContext";
import DOMPurify from "dompurify";
import "../style/BookDetailPage.css";

function BookDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthUser();
  const [book, setBook] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userHasReview, setUserHasReview] = useState(false);
  const [userReviewData, setUserReviewData] = useState(null);
  const [tempRating, setTempRating] = useState(0);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

  const fetchBookDetails = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch book details");
      const bookData = await response.json();

      setBook(bookData);
      if (user && bookData.dbData && bookData.dbData.userFavorites) {
        const currentUserFavorite = bookData.dbData.userFavorites.some(
          favorite => favorite.userId === user.id
        );
        setIsFavorite(currentUserFavorite);
      } else {
        setIsFavorite(false);
      }
 
      if (user && bookData.dbData) {
        const userReview = bookData.dbData.reviews.find(
          review => review.user.id === user.id
        );

        // Find user's rating from userRatings array
        const userRatingObj = bookData.dbData.userRatings.find(
          rating => rating.user.id === user.id
        );

        if (userReview) {
          setUserHasReview(true);
          setUserReviewData(userReview);
          setUserReview(userReview.text);
        }

        if (userRatingObj) {
          const userScore = parseFloat(userRatingObj.score);
          setUserRating(userScore);
          setTempRating(userScore);
        } else {
          setUserRating(0);
          setTempRating(0);
        }
      }
    } catch (err) {
      alert("Sorry, we couldn't load this book's details. Please try again later.");
      setError("Book details temporarily unavailable");
    } finally {
      setLoading(false);
    }
}, [id, API_BASE_URL, user]);

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      alert("You must be logged in to add/remove favorites.");
      return;
    }
    
    try {
      const method = isFavorite ? "DELETE" : "POST";
      const response = await fetch(`${API_BASE_URL}/books/${id}/favorite`, {
        method,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update favorite status");
      }
      
      setIsFavorite(!isFavorite);
    } catch (err) {
      alert("Favorite error: " + err.message);
    }
  };

  const handleStarClick = (rating) => {
    if (!isAuthenticated) {
      alert("You must be logged in to rate the book.");
      return;
    }
    if (userHasReview && !isEditing) {
      alert("You must be in edit mode to change your rating.");
      return;
    }
    setTempRating(rating);
  };

  const handleClearRating = () => {
    setTempRating(0);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your review and rating?")) {
      return;
    }

    try {
      // Delete rating
      if (userRating) {
        const ratingResponse = await fetch(`${API_BASE_URL}/books/${id}/rate`, {
          method: "DELETE",
          credentials: "include",
        });
        
        if (!ratingResponse.ok) {
          throw new Error("Failed to delete rating");
        }
      }

      // Delete review
      if (userHasReview) {
        const reviewResponse = await fetch(`${API_BASE_URL}/books/${id}/review`, {
          method: "DELETE",
          credentials: "include",
        });
        
        if (!reviewResponse.ok) {
          throw new Error("Failed to delete review");
        }
      }

      // Reset all related states
      setUserRating(0);
      setTempRating(0);
      setUserReview("");
      setUserHasReview(false);
      setUserReviewData(null);
      
      // Ensure getting the latest data
      await fetchBookDetails();
    } catch (err) {
      alert("Delete error: " + err.message);
    }
  };

  const handleRateAndReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert("You must be logged in to submit a rating and review.");
      return;
    }

    if (!userReview.trim()) {
      alert("You cannot submit an empty review.");
      return;
    }

    if (!tempRating) {
      alert("Please rate the book before submitting your review.");
      return;
    }

    try {
      // Update rating
      const ratingMethod = userRating ? "PUT" : "POST";
      await fetch(`${API_BASE_URL}/books/${id}/rate`, {
        method: ratingMethod,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: tempRating }),
      });

      // Update review
      const reviewMethod = userHasReview ? "PUT" : "POST";
      const response = await fetch(`${API_BASE_URL}/books/${id}/review`, {
        method: reviewMethod,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userReview }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      const data = await response.json();
      
      // Immediately update local state
      setUserHasReview(true);
      setUserReviewData(data);
      setUserRating(tempRating);
      setIsEditing(false);
      
      // Wait a short time before fetching the latest data
      setTimeout(() => {
        fetchBookDetails();
      }, 100);
      
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  const sanitizedDescription = DOMPurify.sanitize(book.volumeInfo?.description || "");

  return (
    <div className="book-detail-page">
      <div className="book-detail-container">
        <div className="left-column">
          <img
            src={book.volumeInfo.imageLinks?.thumbnail || "/placeholder.png"}
            alt={book.volumeInfo.title}
            className="book-cover"
          />
          <button
            onClick={handleFavoriteClick}
            className={`favorite-button ${isFavorite ? "favorited" : ""}`}
          >
            {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          </button>
        </div>
        <div className="right-column">
          <h1 className="book-title">{book.volumeInfo.title}</h1>
          <p className="book-authors">by {book.volumeInfo.authors?.join(", ") || "Unknown Author"}</p>
          <div
            className="book-description"
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
          {isAuthenticated && (
            <>
              {userHasReview && !isEditing ? (
                <div className="user-review">
                  <div className="review-header">
                    <h3>Your Rating & Review</h3>
                    <div className="review-actions">
                      <button onClick={() => setIsEditing(true)} className="edit-review-button">
                        Edit Rating & Review
                      </button>
                      <button onClick={handleDelete} className="delete-review-button">
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => handleStarClick(star)}
                        className={`star ${
                          Number(star) <= Number(tempRating) ? "filled" : ""
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="review-text">{userReview}</p>
                  <span className="review-dates">
                    Posted: {new Date(userReviewData.createdAt).toLocaleDateString()}
                    {userReviewData.updatedAt && 
                      ` (Edited: ${new Date(userReviewData.updatedAt).toLocaleDateString()})`}
                  </span>
                </div>
              ) : (
                <form onSubmit={handleRateAndReviewSubmit} className="review-form">
                  <p>Rate this book</p>
                  <div className="stars-container">
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          onClick={() => handleStarClick(star)}
                          className={`star ${
                            Number(star) <= Number(tempRating) ? "filled" : ""
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    {tempRating > 0 && (
                      <button 
                        type="button" 
                        onClick={handleClearRating}
                        className="clear-rating-button"
                      >
                        Clear Rating
                      </button>
                    )}
                  </div>
                  <p>Review this book</p>
                  <textarea
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    className="review-textarea"
                    placeholder="Write your review here..."
                  />
                  <div className="review-buttons">
                    <button type="submit" className="submit-review-button">
                      {isEditing ? 'Save Changes' : 'Submit Rating & Review'}
                    </button>
                    {isEditing && (
                      <button 
                        type="button" 
                        className="cancel-edit-button"
                        onClick={() => {
                          setIsEditing(false);
                          setUserReview(userReviewData.text);
                          setTempRating(userRating);
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </>
          )}
          <div className="community-reviews">
            <h2>Community Ratings & Reviews</h2>
            {book.dbData.reviews.length > 0 ? (
              book.dbData.reviews.map((review) => {
                // Find matching rating for this review's user
                const userRating = book.dbData.userRatings.find(
                  rating => rating.user.id === review.user.id
                );
                
                return (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <span className="reviewer-name">{review.user.displayName}</span>
                      <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    {userRating && (
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`star ${Number(star) <= Number(userRating.score) ? "filled" : ""}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="review-text">{review.text}</p>
                  </div>
                );
              })
            ) : (
              <div className="no-reviews">No ratings & reviews yet. Be the first to leave one!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;
