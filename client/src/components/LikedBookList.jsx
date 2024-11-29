import React from 'react';
import LikedBookCard from './LikedBookCard';
import '../style/MyBooks.css';

const LikedBookList = ({ books, onDeleteFavorite }) => {
  return (
    <div className="books-grid">
      {books.map((book) => (
        <LikedBookCard
          key={book.id}
          book={book}
          onDeleteFavorite={onDeleteFavorite}
        />
      ))}
    </div>
  );
};

export default LikedBookList;
