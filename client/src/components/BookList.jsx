import React from 'react';
import BookCard from './BookCard';
import '../style/MyBooks.css';

const BookList = ({ books = [] }) => {
  
  return (
    <div className="list">
      {books.map((book, index) => {
        
        const uniqueKey = book?.id || book?.googleBooksId || `book-${index}`;
        
        const processedBook = {
          id: book.id || book.googleBooksId,
          volumeInfo: {
            title: book.volumeInfo?.title || book.name || 'No title available',
            authors: book.volumeInfo?.authors || [book.author] || ['Unknown author'],
            publishedDate: book.volumeInfo?.publishedDate || book.releasedDate || 'No date available',
            description: book.volumeInfo?.description || 'No description available',
            imageLinks: {
              thumbnail: book.volumeInfo?.imageLinks?.thumbnail || book.cover 
            }
          },
          cover: book.cover || book.volumeInfo?.imageLinks?.thumbnail
        };

        console.log(`Processed book ${index}:`, processedBook);

        return <BookCard key={uniqueKey} book={processedBook} />;
      })}
    </div>
  );
};

export default BookList;