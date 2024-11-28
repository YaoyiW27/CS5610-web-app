import React, { useState } from 'react';
import BookModal from './BookModal';
import '../style/MyBooks.css';

const LikedBookCard = ({ book, onDeleteFavorite }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
    const DEFAULT_IMAGE = 'https://books.google.com/books/content?id=no_cover&printsec=frontcover&img=1&zoom=1&source=gbs_api';

    const handleDeleteClick = async (e) => {
        e.stopPropagation();
        
        if (window.confirm('Are you sure you want to remove this book from favorites?')) {
            setIsDeleting(true);
            try {
                const response = await fetch(`${API_BASE_URL}/books/${book.id}/favorite`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete favorite');
                }

                onDeleteFavorite(book.id);
            } catch (error) {
                console.error('Error deleting:', error);
                alert('Failed to remove from favorites');
            } finally {
                setIsDeleting(false);
            }
        }
    };

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
                    <button 
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        className="delete-button"
                    >
                        {isDeleting ? 'Removing...' : 'Remove from Favorites'}
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

export default LikedBookCard;
