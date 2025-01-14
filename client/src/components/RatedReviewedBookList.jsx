import React from 'react';
import RatedReviewedBookCard from './RatedReviewedBookCard';
import '../style/MyBooks.css';

const RatedReviewedBookList = ({ books, onDeleteReview }) => {
  return (
    <div className="books-grid">
      {books.map((book) => (
        <RatedReviewedBookCard  
          key={book.id} 
          book={book}
          onDeleteReview={onDeleteReview}
        />
      ))}
    </div>
  );
};

export default RatedReviewedBookList;