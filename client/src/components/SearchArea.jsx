import React from 'react';

const SearchArea = ({ searchBook, handleSearch, searchField, genres = [], onGenreSelect, selectedGenre }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        searchBook(e);
    };

    return (
        <div className="search-area">
            <form onSubmit={handleSubmit} className="search-container">
                {/* Search Input with Icon */}
                <div className="search-input-wrapper">
                    <div className="search-icon-wrapper">
                        <span className="search-icon">🔍</span>
                    </div>
                    <input 
                        onChange={handleSearch} 
                        type="text" 
                        className="search-input" 
                        placeholder="Search books..."
                        value={searchField}
                    />
                    <button 
                        type="submit" 
                        className="search-button"
                    >
                        Search
                    </button>
                </div>

                {/* Genres Dropdown */}
                <div className="genres-dropdown-wrapper">
                    <select 
                        value={selectedGenre} 
                        onChange={(e) => onGenreSelect(e.target.value)} 
                        className="genres-dropdown"
                    >
                        <option value="All genres">All genres</option>
                        {genres.map((genre) => (
                            <option key={genre} value={genre}>
                                {genre}
                            </option>
                        ))}
                    </select>
                </div>
            </form>
        </div>
    );
};

export default SearchArea;