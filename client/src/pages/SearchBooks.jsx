import React, { useState } from 'react';
import SearchArea from '../components/SearchArea';
import BookList from '../components/BookList';

const genres = [
    'Art',
    'Biography',
    'Business',
    'Children',
    'Comics',
    'Cooking',
    'Crime',
    'Education',
    'Fantasy',
    'Fiction',
    'History',
    'Horror',
    'Mystery',
    'Poetry',
    'Psychology',
    'Romance',
    'Science',
    'Science Fiction',
    'Self-Help',
    'Sports',
    'Technology',
    'Travel',
];

const SearchBooks = () => {
    const [books, setBooks] = useState([]);
    const [searchField, setSearchField] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('All genres');
    const [isLoading, setIsLoading] = useState(false);

    const API_URL = 'http://localhost:3001';

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchField.trim()) return;

        try {
            setIsLoading(true);
            let query = searchField.trim();
            if (selectedGenre !== 'All genres') {
                query += `+subject:${selectedGenre}`;
            }

            const response = await fetch(`${API_URL}/books/search/${encodeURIComponent(query)}`, {
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to search books');
            const data = await response.json();
            setBooks(data.items || []);
        } catch (err) {
            alert('Search error: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchInput = (e) => {
        setSearchField(e.target.value);
    };

    const handleGenreSelect = (genre) => {
        setSelectedGenre(genre);
    };

    return (
        <div className="main-container">
            <SearchArea
                searchBook={handleSearch}
                handleSearch={handleSearchInput}
                searchField={searchField}
                genres={genres} // Pass genres directly
                onGenreSelect={handleGenreSelect}
                selectedGenre={selectedGenre}
            />
            <div className="books-container">
                {isLoading ? (
                    <div className="loading">Searching for books...</div>
                ) : (
                    <BookList books={books} />
                )}
            </div>
        </div>
    );
};

export default SearchBooks;