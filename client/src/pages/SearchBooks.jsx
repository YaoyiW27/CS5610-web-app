import React, { useState, useEffect } from 'react';
import SearchArea from '../components/SearchArea';
import BookList from '../components/BookList';
import Sidebar from '../components/Sidebar';
import { useBooks } from '../hooks/useBooks';
import '../style/SearchPage.css';

// Get environment variables
const { REACT_APP_API_BASE_URL = 'http://localhost:3001/api' } = process.env;

function SearchBooks() {
  const [books, setBooks] = useState([]);
  const [searchField, setSearchField] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All genres');
  const [isTrending, setIsTrending] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { error } = useBooks();

  const constructSearchUrl = (searchQuery) => {
    const decodedQuery = decodeURIComponent(searchQuery);
    return `${REACT_APP_API_BASE_URL}/books/search/${decodedQuery.replace(/ /g, '+')}`;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchBooksByGenre = async () => {
      if (selectedGenre === 'All genres') {
        if (isMounted) {
          setBooks([]);
          setIsTrending(true);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        const searchQuery = `subject:${selectedGenre}`;
        const url = constructSearchUrl(searchQuery);

        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }

        const data = await response.json();
        
        if (isMounted) {
          if (data.items) {
            setBooks(data.items);
          } else {
            setBooks([]);
          }
          setIsTrending(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Search error:', err);
        if (isMounted) {
          alert("An error occurred while searching for books. Please try again.");
          setIsLoading(false);
        }
      }
    };

    if (selectedGenre !== 'All genres') {
      fetchBooksByGenre();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedGenre]);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchField.trim() && selectedGenre === 'All genres') {
      setBooks([]);
      setIsTrending(true);
      return;
    }

    try {
      setIsLoading(true);
      let searchQuery = searchField.trim();
      if (selectedGenre !== 'All genres') {
        searchQuery = searchQuery 
          ? `${searchQuery}+subject:${selectedGenre}`
          : `subject:${selectedGenre}`;
      }

      const url = constructSearchUrl(searchQuery);

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search books');
      }

      const data = await response.json();
      if (data.items) {
        setBooks(data.items);
      } else {
        setBooks([]);
      }
      setSearchField('');
      setIsTrending(false);
      setIsLoading(false);
    } catch (err) {
      console.error('Search error:', err);
      alert("An error occurred while searching for books. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSearchInput = (e) => {
    setSearchField(e.target.value);
  };

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    if (genre === 'All genres') {
      setBooks([]);
      setIsTrending(true);
      setIsLoading(false);
    }
  };

  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  return (
    <div className="main-container">
      <Sidebar 
        onGenreSelect={handleGenreSelect} 
        selectedGenre={selectedGenre} 
      />
      <div className="content-area">
        <div className="sticky-search">
          <SearchArea 
            searchBook={handleSearch} 
            handleSearch={handleSearchInput}
            selectedGenre={selectedGenre}
            searchField={searchField}
          />
        </div>
        {isTrending && selectedGenre !== 'All genres' && (
          <h1 className="trending-title">New Releases in {selectedGenre}</h1>
        )}
        {isLoading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Searching for books...</p>
          </div>
        ) : (
          <>
            {selectedGenre === 'All genres' ? (
              <div className="no-results">
                <p>Select a genre to see new releases</p>
              </div>
            ) : books.length === 0 ? (
              <div className="no-results">
                <p>No books found. Try a different search term or genre.</p>
              </div>
            ) : (
              <BookList books={books} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SearchBooks;
