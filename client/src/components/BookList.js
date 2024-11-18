import React from 'react';
import BookCard from './BookCard';

const BookList = ({ books = [] }) => {  // Default to empty array if books is undefined
    return (
        <div className="list">
            {books.map((book, i) => {
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
                        key={i}
                        book={safeBook}
                    />
                );
            })}       
        </div>
    );
}

export default BookList;
