import React from 'react';

const SearchArea = ({ searchBook, handleSearch, searchField }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        searchBook(e);
    };

    return (
        <div className="search-area">
            <form onSubmit={handleSubmit} className="search-container">
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input 
                        onChange={handleSearch} 
                        type="text" 
                        className="search-input" 
                        placeholder="Search books..."
                        value={searchField}
                    />
                </div>
                <button 
                    type="submit" 
                    className="search-button"
                >
                    Search
                </button>
                <select 
                    defaultValue="Sort" 
                    className="sort-select"
                >
                    <option disabled value="Sort">Sort</option>
                    <option value="Newest">Newest</option>
                    <option value="Oldest">Oldest</option>
                </select>
            </form>
        </div>
    );
};

export default SearchArea;