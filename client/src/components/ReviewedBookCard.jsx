import React, { useState } from 'react';
import BookModal from './BookModal';
import '../style/MyBooks.css';

const ReviewedBookCard = ({ book }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageError, setImageError] = useState(false);

    const DEFAULT_IMAGE = 'https://books.google.com/books/content?id=no_cover&printsec=frontcover&img=1&zoom=1&source=gbs_api';

    const getImageUrl = () => {
        if (imageError) {
            console.log("Using default image due to error");
            return DEFAULT_IMAGE;
        }

        const url = book?.volumeInfo?.imageLinks?.thumbnail || 
                   book?.volumeInfo?.imageLinks?.smallThumbnail || 
                   book?.cover || 
                   DEFAULT_IMAGE;
                   
        console.log("Selected image URL:", url);
        return url.replace('http://', 'https://');
    };

    const handleCardClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="card-container" onClick={handleCardClick}>
                {/* Cover */}
                <img 
                    src={getImageUrl()}
                    alt={book?.volumeInfo?.title || 'Book cover'}
                    onError={(e) => {
                        console.error(`Failed to load image for book:`, book);
                        setImageError(true);
                        e.target.src = DEFAULT_IMAGE;
                    }}
                    className="book-cover"
                />

                {/* Description */}
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

                {/* Your Review */}
                <div className="review-content">
                    <h4>Your Review:</h4>
                    <p>{book.review.text}</p>
                    <span className="review-date">
                        {new Date(book.review.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Modal */}
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