import React, { useState, useEffect } from 'react';
import BookList from '../components/BookList';

const MyBooks = () => {
    const [activeTab, setActiveTab] = useState('favorites');
    const [favoriteBooks, setFavoriteBooks] = useState([]);
    const [commentedBooks, setCommentedBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 模拟从API获取数据
        fetchUserBooks();
    }, []);

    const fetchUserBooks = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API calls
            // 模拟API响应
            const favoritesResponse = [
                {
                    id: "1",
                    volumeInfo: {
                        title: "The Great Gatsby",
                        authors: ["F. Scott Fitzgerald"],
                        publishedDate: "1925",
                        imageLinks: {
                            thumbnail: "/placeholder-book.png"
                        }
                    }
                }
            ];

            const commentedResponse = [
                {
                    id: "2",
                    volumeInfo: {
                        title: "To Kill a Mockingbird",
                        authors: ["Harper Lee"],
                        publishedDate: "1960",
                        imageLinks: {
                            thumbnail: "/placeholder-book.png"
                        }
                    },
                    userComment: "A masterpiece of American literature"
                }
            ];

            setFavoriteBooks(favoritesResponse);
            setCommentedBooks(commentedResponse);
        } catch (error) {
            console.error('Error fetching user books:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-container">
            <div className="content-area">
                <div className="sticky-search">
                    <div className="search-container">
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>My Books</h1>
                    </div>
                </div>

                <div className="my-books-tabs">
                    <div className="tabs-header">
                        <button 
                            className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
                            onClick={() => setActiveTab('favorites')}
                        >
                            <i className="fas fa-star"></i>
                            Favorite Books
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'commented' ? 'active' : ''}`}
                            onClick={() => setActiveTab('commented')}
                        >
                            <i className="fas fa-comment"></i>
                            Commented Books
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading">
                            <div className="loading-spinner"></div>
                            <p>Loading your books...</p>
                        </div>
                    ) : (
                        <div className="tabs-content">
                            {activeTab === 'favorites' && (
                                <div className="tab-pane">
                                    <BookList books={favoriteBooks} />
                                </div>
                            )}
                            {activeTab === 'commented' && (
                                <div className="tab-pane">
                                    <BookList books={commentedBooks} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBooks;