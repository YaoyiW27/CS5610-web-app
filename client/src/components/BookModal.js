import React from 'react';

const BookModal = ({ book, onClose, isOpen }) => {
    if (!isOpen || !book) return null;

    // Safely destructure with default values
    const {
        title = 'No title available',
        authors = ['Unknown author'],
        description = 'No description available',
        averageRating = 0,
        ratingsCount = 0,
        publishedDate = 'No date available'
    } = book?.volumeInfo || {};

    // Generate stars based on rating
    const renderStars = () => {
        const stars = [];
        const rating = Math.round(averageRating * 2) / 2; // Round to nearest 0.5
        
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<span key={i} className="star filled">★</span>);
            } else if (i - 0.5 === rating) {
                stars.push(<span key={i} className="star half-filled">★</span>);
            } else {
                stars.push(<span key={i} className="star">★</span>);
            }
        }
        return stars;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <p className="modal-author">by {Array.isArray(authors) ? authors.join(', ') : authors}</p>
                </div>
                <div className="modal-rating">
                    <div className="stars">{renderStars()}</div>
                    <span className="rating-text">
                        {averageRating?.toFixed(2) || 'No'} avg rating — {ratingsCount || 0} ratings
                        {publishedDate && ` — published ${publishedDate.substring(0, 4)}`}
                    </span>
                </div>
                <div className="modal-description">
                    {description}
                </div>
            </div>
        </div>
    );
};

export default BookModal;
