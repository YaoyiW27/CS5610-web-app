import React from 'react';
import ReviewedBookCard from './ReviewedBookCard';
import '../style/MyBooks.css';

const ReviewedBookList = ({ books, onDeleteReview }) => {
  return (
    <div className="reviewed-books-list">
      {books.map((book) => (
        <ReviewedBookCard 
          key={book.id} 
          book={book}
          onDeleteReview={onDeleteReview}
        />
      ))}
    </div>
  );
};

export default ReviewedBookList;