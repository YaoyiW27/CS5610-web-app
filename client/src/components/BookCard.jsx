import React, { useState } from 'react';
import BookModal from './BookModal';

const BookCard = ({ book }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Safely access volumeInfo with default values
    const {
        imageLinks = {},
        title = 'No title available',
        authors = ['Unknown author'],
        publishedDate = 'No date available'
    } = book?.volumeInfo || {};

    // Get the best available image URL
    const getImageUrl = () => {
        if (imageError) return '/placeholder-book.png';
        return imageLinks?.thumbnail || 
               imageLinks?.smallThumbnail || 
               '/placeholder-book.png';
    };

    return (
        <>
            <div className="card-container" onClick={() => setIsModalOpen(true)}>
                <img 
                    src={getImageUrl()}
                    alt={title}
                    onError={(e) => {
                        console.error(`Failed to load image for book: ${title}`);
                        setImageError(true);
                        e.target.src = '/placeholder-book.png';
                    }}
                />
                <div className="desc">
                    <h2>{title}</h2>
                    <h3>Author: {Array.isArray(authors) ? authors.join(', ') : authors}</h3>
                    <p>Published Date: {publishedDate === '0000' ? 'Not available' : publishedDate?.substring(0, 4)}</p>
                </div>
            </div>
            <BookModal 
                book={book}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default BookCard;
