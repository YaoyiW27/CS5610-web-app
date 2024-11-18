import React from 'react';

const SearchArea = (props) => {
    return (
        <div className="search-area">
            <div className="search-container">
                <input 
                    onChange={props.handleSearch} 
                    type="text" 
                    className="search-input" 
                    placeholder="Search books..."
                    value={props.searchField} // Control the input value
                />
                <button 
                    type="submit" 
                    className="search-button" 
                    onClick={props.searchBook}
                >
                    Search
                </button>
                <div className="sort-dropdown">
                    <select 
                        defaultValue="Sort" 
                        onChange={props.handleSort}
                        className="sort-select"
                    >
                        <option disabled value="Sort">Sort</option>
                        <option value="Newest">Newest</option>
                        <option value="Oldest">Oldest</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

export default SearchArea;
