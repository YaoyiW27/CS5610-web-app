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

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    async function fetchUserBooks() {
        console.log("Fetching user books...");
    
        try {
            const favResponse = await fetch(`${API_BASE_URL}/user/favorites`, { 
                credentials: "include" 
            });

            const reviewResponse = await fetch(`${API_BASE_URL}/books/user/reviews`, { 
                credentials: "include" 
            });
            
            if (favResponse.ok) {
                const favorites = await favResponse.json();
                console.log("Raw favorites data:", JSON.stringify(favorites, null, 2));
                
                const processedFavorites = favorites.map(favorite => ({
                    id: favorite.id,
                    volumeInfo: {
                        title: favorite.volumeInfo.title,
                        authors: favorite.volumeInfo.authors,
                        publishedDate: favorite.volumeInfo.publishedDate,
                        description: favorite.volumeInfo.description,
                        imageLinks: favorite.volumeInfo.imageLinks
                    },
                    cover: favorite.cover
                }));
                
                console.log("Processed favorites:", processedFavorites);
                setFavoriteBooks(processedFavorites);
            } else {
                throw new Error("Failed to fetch favorites");
            }

            if (reviewResponse.ok) {
              const reviews = await reviewResponse.json();
              console.log("Raw reviews data:", JSON.stringify(reviews, null, 2));
              setReviewedBooks(reviews); 

              const processedReviews = reviews.map(review => ({
                id: review.id,
                volumeInfo: {
                  title: review.volumeInfo.title,
                  authors: review.volumeInfo.authors,
                  publishedDate: review.volumeInfo.publishedDate,
                  description: review.volumeInfo.description,
                  imageLinks: review.volumeInfo.imageLinks 
                },
                // get pic from volumeInfo.imageLinks 
                cover: review.volumeInfo.imageLinks?.thumbnail || '', 
                review: {
                  text: review.review.text,
                  createdAt: review.review.createdAt
                }
              }));
              
              console.log("Processed reviews:", processedReviews);

            }  else {
                throw new Error("Failed to fetch reviews");
            }

        } catch (err) {
            console.error("Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (isAuthenticated) {
        fetchUserBooks();
    }
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
                  <ReviewedBookList books={reviewedBooks} />
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