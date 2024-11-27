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

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

  const fetchBookDetails = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch book details");
      const bookData = await response.json();
      setBook(bookData);
      setIsFavorite(bookData.dbData.userFavorites?.length > 0);
      
      if (!userRating) {
        setUserRating(bookData.dbData.userRating || 0);
      }
      
      if (user && bookData.dbData.reviews) {
        const userReview = bookData.dbData.reviews.find(
          review => review.user.id === user.id
        );
        if (userReview) {
          setUserHasReview(true);
          setUserReviewData(userReview);
          setUserReview(userReview.text);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, API_BASE_URL, user, userRating]);

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      alert("You must be logged in to add/remove favorites.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}/favorite`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to toggle favorite");
      setIsFavorite(!isFavorite);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStarClick = async (rating) => {
    if (!isAuthenticated) {
      alert("You must be logged in to rate the book.");
      return;
    }
    try {
      const method = userRating ? "PUT" : "POST";
      const response = await fetch(`${API_BASE_URL}/books/${id}/rate`, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: rating }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update rating");
      }
      
      setUserRating(rating);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert("You must be logged in to submit a review.");
      return;
    }

    if (!userReview.trim()) {
      alert("You cannot submit an empty review.");
      return;
    }

    try {
      const method = userHasReview ? "PUT" : "POST";
      const response = await fetch(`${API_BASE_URL}/books/${id}/review`, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userReview }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      const data = await response.json();
      setUserHasReview(true);
      setUserReviewData(data);
      setIsEditing(false);
      fetchBookDetails();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
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
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => handleStarClick(star)}
                    className={`star ${Number(star) <= Number(userRating) ? "filled" : ""}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              {userHasReview && !isEditing ? (
                <div className="user-review">
                  <div className="review-header">
                    <h3>Your Review</h3>
                    <button onClick={() => setIsEditing(true)} className="edit-review-button">
                      Edit Review
                    </button>
                  </div>
                  <p className="review-text">{userReview}</p>
                  <span className="review-dates">
                    Posted: {new Date(userReviewData.createdAt).toLocaleDateString()}
                    {userReviewData.updatedAt && 
                      ` (Edited: ${new Date(userReviewData.updatedAt).toLocaleDateString()})`}
                  </span>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="review-form">
                  <textarea
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    className="review-textarea"
                    placeholder="Write your review here..."
                  />
                  <div className="review-buttons">
                    <button type="submit" className="submit-review-button">
                      {isEditing ? 'Save Changes' : 'Submit Review'}
                    </button>
                    {isEditing && (
                      <button 
                        type="button" 
                        className="cancel-edit-button"
                        onClick={() => {
                          setIsEditing(false);
                          setUserReview(userReviewData.text);
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
            <h2>Community Reviews</h2>
            {book.dbData.reviews.length > 0 ? (
              book.dbData.reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="reviewer-name">{review.user.displayName}</span>
                    <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="review-text">{review.text}</p>
                </div>
              ))
            ) : (
              <div className="no-reviews">No reviews yet. Be the first to leave one!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;