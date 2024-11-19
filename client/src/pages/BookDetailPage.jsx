import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import '../style/BookDetailPage.css';

function BookDetailPage() {
  const { id } = useParams(); // 获取路由参数中的书籍ID
  const [book, setBook] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [communityReviews, setCommunityReviews] = useState([]);

  // 获取书籍详细信息
  useEffect(() => {
    fetchBookDetails();
    checkIfFavorite();
    loadCommunityReviews();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
      const data = await response.json();
      setBook(data);
    } catch (error) {
      console.error('Error fetching book details:', error);
    }
  };

  // 检查书籍是否已收藏
  const checkIfFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteBooks')) || [];
    const isFav = favorites.some((favBook) => favBook.id === id);
    setIsFavorite(isFav);
  };

  // 处理收藏点击事件
  const handleFavoriteClick = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteBooks')) || [];
    if (isFavorite) {
      // 移除收藏
      const updatedFavorites = favorites.filter((favBook) => favBook.id !== id);
      localStorage.setItem('favoriteBooks', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
    } else {
      // 添加收藏
      const newFavorite = {
        id: book.id,
        volumeInfo: book.volumeInfo,
      };
      favorites.push(newFavorite);
      localStorage.setItem('favoriteBooks', JSON.stringify(favorites));
      setIsFavorite(true);
    }
  };

  // 处理评分点击事件
  const handleStarClick = (rating) => {
    setUserRating(rating);
  };

  // 提交评论
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const newReview = {
      bookId: id,
      rating: userRating,
      review: userReview,
      date: new Date().toISOString(),
    };
    reviews.push(newReview);
    localStorage.setItem('reviews', JSON.stringify(reviews));
    setUserRating(0);
    setUserReview('');
    alert('Your review has been submitted!');
    loadCommunityReviews(); // 重新加载社区评论
  };

  // 加载社区评论
  const loadCommunityReviews = () => {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const bookReviews = reviews.filter((review) => review.bookId === id);
    setCommunityReviews(bookReviews);
  };

  if (!book) {
    return <div>Loading book details...</div>;
  }

  const {
    title = 'No title available',
    authors = ['Unknown author'],
    description = 'No description available',
    imageLinks = {},
  } = book.volumeInfo;

  // 在这里定义 sanitizedDescription，因为此时 description 已经定义
  const sanitizedDescription = DOMPurify.sanitize(description);

  return (
    <div className="book-detail-page">
      <div className="book-detail-container">
        <div className="left-column">
          <img
            src={imageLinks.thumbnail || '/placeholder-book.png'}
            alt={title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-book.png';
            }}
          />
          <button
            className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
            onClick={handleFavoriteClick}
          >
            <i className="fa-solid fa-heart"></i>
            {isFavorite ? ' Favorited' : ' Add to Favorites'}
          </button>
        </div>
        <div className="right-column">
          <h1>{title}</h1>
          <h3>by {Array.isArray(authors) ? authors.join(', ') : authors}</h3>
          {/* 使用 dangerouslySetInnerHTML 来渲染描述 */}
          <div
            className="book-description"
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          ></div>

          <div className="ratings-reviews">
            <h2>Ratings & Reviews</h2>
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
                required
              ></textarea>
              <button type="submit">Submit Review</button>
            </form>
          </div>

          <div className="community-reviews">
            <h2>Community Reviews</h2>
            {communityReviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              communityReviews.map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`star ${review.rating >= star ? 'filled' : ''}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p>{review.review}</p>
                  <small>{new Date(review.date).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;