import React, { useState, useEffect } from 'react';

const Sidebar = ({ onGenreSelect, selectedGenre }) => {
    const [activeGenre, setActiveGenre] = useState('All genres');

    useEffect(() => {
        // Set default genre when component mounts
        if (!selectedGenre) {
            onGenreSelect('All genres');
        }
    }, []);

    const genres = [
        'All genres',
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
        'Travel'
    ];

    const handleGenreClick = (genre) => {
        setActiveGenre(genre);
        onGenreSelect(genre);
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">Genres</div>
            <div className="sidebar-content">
                {genres.map((genre, index) => (
                    <div 
                        key={index} 
                        className={`sidebar-item ${genre === activeGenre ? 'active' : ''}`}
                        onClick={() => handleGenreClick(genre)}
                    >
                        {genre}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
