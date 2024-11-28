import React from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import '../style/Modal.css'; 

const BookModal = ({ book, onClose, isOpen }) => {
  const navigate = useNavigate();
  const DEFAULT_IMAGE = 'https://books.google.com/books/content?id=no_cover&printsec=frontcover&img=1&zoom=1&source=gbs_api';

  if (!isOpen || !book) return null;

  const bookId = book.id; 
  
  const getCoverImage = () => {
      const url = book?.volumeInfo?.imageLinks?.thumbnail || 
                 book?.volumeInfo?.imageLinks?.smallThumbnail || 
                 book?.cover || 
                 DEFAULT_IMAGE;
      return url.replace('http://', 'https://');
  };

  const {
      title = 'Unknown Title',
      authors = ['Unknown Author'],
      description = 'No description available',
      publishedDate = 'Unknown Date',
  } = book.volumeInfo || book;

  // Use dbData for averageRating and ratingsCount
  const averageRating = book.dbData?.averageRating || 0;
  const ratingsCount = book.dbData?.userRatings?.length || 0;

  // use DOMPurify to sanitize the description
  const sanitizedDescription = DOMPurify.sanitize(description);

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
        <div className="modal-rating">
          <div className="stars">{renderStars()}</div>
          <span className="rating-text">
            {averageRating?.toFixed(2) || 'No'} avg rating —{' '}
            {ratingsCount || 0} ratings
            {publishedDate && ` — published ${publishedDate.substring(0, 4)}`}
          </span>
        </div>
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