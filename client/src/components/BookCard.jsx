import React, { useState } from 'react';
import BookModal from './BookModal';
import '../style/Books.css'; 

const BookCard = ({ book }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const DEFAULT_IMAGE = 'https://books.google.com/books/content?id=no_cover&printsec=frontcover&img=1&zoom=1&source=gbs_api';

  const getImageUrl = () => {
    if (imageError) return DEFAULT_IMAGE;

    const url = book?.volumeInfo?.imageLinks?.thumbnail || 
                book?.volumeInfo?.imageLinks?.smallThumbnail || 
                book?.cover || 
                DEFAULT_IMAGE;

    return url.replace('http://', 'https://');
  };

  return (
    <>
      <div className="card-container" onClick={() => setIsModalOpen(true)}>
        <img
          src={getImageUrl()}
          alt={book?.volumeInfo?.title || 'Book cover'}
          onError={(e) => {
            alert(`Failed to load image for book: ${book?.volumeInfo?.title || 'Unknown Title'}`);
            setImageError(true);
            e.target.src = DEFAULT_IMAGE;
          }}
          className="book-cover"
        />
        <div className="desc">
          <h2>{book?.volumeInfo?.title || 'Unknown Title'}</h2>
          <h3>{book?.volumeInfo?.authors?.join(', ') || book?.author || 'Unknown Author'}</h3>
          <p>{book?.volumeInfo?.publishedDate ? new Date(book.volumeInfo.publishedDate).getFullYear() : 'Unknown Year'}</p>
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

export default BookCard;
