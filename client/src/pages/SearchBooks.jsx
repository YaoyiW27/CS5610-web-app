import React, { useState } from 'react';
import SearchArea from '../components/SearchArea';
import BookList from '../components/BookList';
import Sidebar from '../components/Sidebar';

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
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to search books');
      const data = await response.json();
      setBooks(data.items || []);
    } catch (err) {
      console.error('Search error:', err);
      alert("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInput = (e) => {
    setSearchField(e.target.value);
  };

  const handleGenreSelect = async (genre) => {
    setSelectedGenre(genre);
    if (genre === 'All genres') {
      setBooks([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/books/search/${encodeURIComponent(`subject:${genre}`)}`);
      if (!response.ok) throw new Error('Failed to fetch books');

      const data = await response.json();
      setBooks(data.items || []);
    } catch (err) {
      console.error('Genre search error:', err);
      alert("Failed to fetch books for this genre.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="search-layout">
        <aside className="genre-sidebar">
          <Sidebar onGenreSelect={handleGenreSelect} selectedGenre={selectedGenre} />
        </aside>
        <main className="search-content">
          <SearchArea 
            searchBook={handleSearch}
            handleSearch={handleSearchInput}
            searchField={searchField}
          />
          <div className="books-container">
            {isLoading ? (
              <div className="loading">Searching for books...</div>
            ) : (
              <BookList books={books} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchBooks;