import React from 'react';
import BookCard from './BookCard';

const BookList = ({ books = [] }) => {
    return (
      <div className="list">
        {books.map((book, index) => {
          // Create a unique key using both the book ID and index
          const uniqueKey = `${book?.id || 'unknown'}-${index}`;
          
          // Safely destructure book data with default values
          const safeBook = {
            ...book,
            volumeInfo: {
              title: book?.volumeInfo?.title || 'No title available',
              authors: book?.volumeInfo?.authors || ['Unknown author'],
              publishedDate: book?.volumeInfo?.publishedDate || 'No date available',
              description: book?.volumeInfo?.description || 'No description available',
              averageRating: book?.volumeInfo?.averageRating || 0,
              ratingsCount: book?.volumeInfo?.ratingsCount || 0,
              imageLinks: {
                thumbnail: book?.volumeInfo?.imageLinks?.thumbnail || '/placeholder-book.png',
                ...book?.volumeInfo?.imageLinks
              }
            }
          };
  
          return (
            <BookCard 
              key={uniqueKey}
              book={safeBook}
            />
          );
        })}       
      </div>
    );
};

export default BookList;
