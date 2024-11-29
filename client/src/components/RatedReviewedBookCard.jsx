import React, { useState } from 'react';
import BookModal from './BookModal';
import '../style/MyBooks.css';

const RatedReviewedBookCard = ({ book, onDeleteReview }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
    const DEFAULT_IMAGE = 'https://books.google.com/books/content?id=no_cover&printsec=frontcover&img=1&zoom=1&source=gbs_api';

    const handleDeleteClick = async (e) => {
        e.stopPropagation();
        
        if (window.confirm('Are you sure you want to delete this rating and review?')) {
            setIsDeleting(true);
            try {
                // Send two delete requests in parallel
                await Promise.all([
                    fetch(`${API_BASE_URL}/books/${book.id}/review`, {
                        method: 'DELETE',
                        credentials: 'include'
                    }),
                    fetch(`${API_BASE_URL}/books/${book.id}/rate`, {
                        method: 'DELETE',
                        credentials: 'include'
                    })
                ]);

                onDeleteReview(book.id);
            } catch (error) {
                console.error('Error deleting:', error);
                alert('Failed to delete rating and review');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const renderStars = (score) => {
        return [...Array(5)].map((_, index) => (
            <span
                key={index}
                className={`star ${index < score ? "filled" : ""}`}
            >
                ★
            </span>
        ));
    };

    console.log(book.volumeInfo.imageLinks);
    
    return (
        <>
            <div className="card-container" onClick={() => setIsModalOpen(true)}>
                <img
                    src={book?.volumeInfo?.imageLinks?.thumbnail || DEFAULT_IMAGE}
                    alt={book?.volumeInfo?.title || 'Book cover'}
                    onError={(e) => {
                        e.target.src = DEFAULT_IMAGE;
                    }}
                    className="book-cover"
                />
                <div className="desc">
                    <h2>{book?.volumeInfo?.title || 'Unknown Title'}</h2>
                    <h3>{book?.volumeInfo?.authors?.join(', ') || 'Unknown Author'}</h3>
                    <div className="stars-container">
                        {renderStars(book.rating?.score || 0)}
                    </div>
                    <div className="review-content">
                        <p>{book.review.text}</p>
                        <span className="review-date">
                            {new Date(book.review.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <button 
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        className="delete-button"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Rating & Review'}
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <BookModal 
                    book={book}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};

export default RatedReviewedBookCard;