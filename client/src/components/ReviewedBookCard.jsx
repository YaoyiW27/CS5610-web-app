import React, { useState } from 'react';
import BookModal from './BookModal';
import '../style/MyBooks.css';

const ReviewedBookCard = ({ book, onDeleteReview }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
    const DEFAULT_IMAGE = 'https://books.google.com/books/content?id=no_cover&printsec=frontcover&img=1&zoom=1&source=gbs_api';

    const getImageUrl = () => {
        if (imageError) {
            return DEFAULT_IMAGE;
        }
        const url = book?.volumeInfo?.imageLinks?.thumbnail || 
                   book?.volumeInfo?.imageLinks?.smallThumbnail || 
                   book?.cover || 
                   DEFAULT_IMAGE;
        return url.replace('http://', 'https://');
    };

    const handleCardClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleDeleteClick = async (e) => {
        e.stopPropagation(); // Prevent card click event from firing
        
        if (window.confirm('Are you sure you want to delete this review?')) {
            setIsDeleting(true);
            try {
                const response = await fetch(`${API_BASE_URL}/books/${book.id}/review`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete review');
                }

                if (onDeleteReview) {
                    onDeleteReview(book.id);
                }
            } catch (error) {
                console.error('Error deleting review:', error);
                alert('Failed to delete review');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <>
            <div className="card-container" onClick={handleCardClick}>
                <img 
                    src={getImageUrl()}
                    alt={book?.volumeInfo?.title || 'Book cover'}
                    onError={(e) => {
                        setImageError(true);
                        e.target.src = DEFAULT_IMAGE;
                    }}
                    className="book-cover"
                />

                <div className="desc">
                    <h2>{book?.volumeInfo?.title || 'Unknown Title'}</h2>
                    <h3>
                        {book?.volumeInfo?.authors?.join(', ') || book?.author || 'Unknown Author'}
                    </h3>
                    <p>
                        {book?.volumeInfo?.publishedDate 
                            ? new Date(book.volumeInfo.publishedDate).getFullYear()
                            : 'Unknown Year'}
                    </p>
                </div>

                <div className="review-content">
                    <h4>Your Review:</h4>
                    <p>{book.review.text}</p>
                    <span className="review-date">
                        {new Date(book.review.createdAt).toLocaleDateString()}
                    </span>
                    <button 
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Review'}
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <BookModal 
                    book={book}
                    review={book.review}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
};

export default ReviewedBookCard;