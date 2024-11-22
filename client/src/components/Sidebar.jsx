const Sidebar = ({ onGenreSelect, selectedGenre }) => {
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
        'Travel'
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">Genres</div>
            <div className="sidebar-content">
                {genres.map((genre) => (
                    <button 
                        key={genre}
                        className={`sidebar-item ${genre === selectedGenre ? 'active' : ''}`}
                        onClick={() => onGenreSelect(genre)}
                    >
                        <span className="genre-name">{genre}</span>
                        {genre === selectedGenre && (
                            <span className="genre-icon">›</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;