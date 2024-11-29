import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import '../style/Modal.css'; 

const BookModal = ({ book, onClose, isOpen }) => {
  const navigate = useNavigate();
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const DEFAULT_IMAGE = 'https://books.google.com/books/content?id=no_cover&printsec=frontcover&img=1&zoom=1&source=gbs_api';
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

  const getCoverImage = () => {
    const displayData = bookDetails || book;
    const url = displayData?.volumeInfo?.imageLinks?.thumbnail || 
                displayData?.volumeInfo?.imageLinks?.smallThumbnail || 
                displayData?.cover || 
                DEFAULT_IMAGE;
    return url.replace('http://', 'https://');
  };

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!book?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/books/${book.id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch book details');
        const data = await response.json();
        console.log('Modal book details:', data);
        setBookDetails(data);
      } catch (err) {
        console.error('Error fetching book details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && book) {
      fetchBookDetails();
    }
  }, [isOpen, book, API_BASE_URL]);

  if (!isOpen || !book) return null;
  if (loading) return <div className="modal-overlay"><div className="modal-content">Loading...</div></div>;

  const bookId = book.id;
  
  // Use detailed data or fallback to search result data
  const displayData = bookDetails || book;
  const {
    title = 'Unknown Title',
    authors = ['Unknown Author'],
    description = 'No description available',
    publishedDate = 'Unknown Date',
  } = displayData.volumeInfo || displayData;

  // Use detailed rating data
  const averageRating = bookDetails?.dbData?.averageRating || 0;
  const ratingsCount = bookDetails?.dbData?.userRatings?.length || 0;

  // use DOMPurify to sanitize the description
  const sanitizedDescription = DOMPurify.sanitize(description);

  console.log('Book data in modal:', book);
  console.log('Average rating:', averageRating);
  console.log('Ratings count:', ratingsCount);

  const renderStars = () => {
    const stars = [];
    const rating = Math.round(averageRating * 2) / 2; 

    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <span key={i} className="star filled">
            ★
          </span>
        );
      } else if (i - 0.5 === rating) {
        stars.push(
          <span key={i} className="star half-filled">
            ★
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="star">
            ★
          </span>
        );
      }
    }
    return stars;
  };

  const handleTitleClick = () => {
    onClose(); // close the modal
    navigate(`/book/${bookId}`); // navigate to the book details page
  };

  // Only show rating when detailed data is available
  const renderRating = () => {
    if (!bookDetails) return null;
    
    return (
      <div className="modal-rating">
        <div className="stars">{renderStars()}</div>
        <span className="rating-text">
          {averageRating?.toFixed(2) || 'No'} avg rating —{' '}
          {ratingsCount || 0} ratings
          {publishedDate && ` — published ${publishedDate.substring(0, 4)}`}
        </span>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="modal-header">
          <img
            src={getCoverImage()}
            alt={title}
            onError={(e) => {
              e.target.src =  DEFAULT_IMAGE;
            }}
            style={{ maxWidth: '100%', marginBottom: '1rem' }}
          />
          <h2
            onClick={handleTitleClick}
            style={{ cursor: 'pointer', color: '#007bff' }}
          >
            {title}
          </h2>
          <p className="modal-author">
            by {Array.isArray(authors) ? authors.join(', ') : authors}
          </p>
        </div>
        {renderRating()}
        {/* use dangerouslySetInnerHTML */}
        <div
          className="modal-description"
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        ></div>
      </div>
    </div>
  );
};

export default BookModal;