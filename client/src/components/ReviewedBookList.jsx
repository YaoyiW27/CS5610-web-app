import React from 'react';
import ReviewedBookCard from './ReviewedBookCard';
import '../style/MyBooks.css';

const ReviewedBookList = ({ books }) => {
  return (
    <div className="list"> 
      {books.map(book => (
        <ReviewedBookCard 
          key={book.id} 
          book={book} 
        />
      ))}
    </div>
  );
};

export default ReviewedBookList;