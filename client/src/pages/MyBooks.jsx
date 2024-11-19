import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookList from '../components/BookList';

const MyBooks = () => {
  const [activeTab, setActiveTab] = useState('favorites');
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [commentedBooks, setCommentedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 检查用户是否已登录
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // 用户已登录，获取书籍数据
      fetchUserBooks();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUserBooks = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      // 模拟API响应
      const favoritesResponse = [
        {
          id: '1',
          volumeInfo: {
            title: 'The Great Gatsby',
            authors: ['F. Scott Fitzgerald'],
            publishedDate: '1925',
            imageLinks: {
              thumbnail: '/placeholder-book.png',
            },
          },
        },
      ];

      const commentedResponse = [
        {
          id: '2',
          volumeInfo: {
            title: 'To Kill a Mockingbird',
            authors: ['Harper Lee'],
            publishedDate: '1960',
            imageLinks: {
              thumbnail: '/placeholder-book.png',
            },
          },
          userComment: 'A masterpiece of American literature',
        },
      ];

      setFavoriteBooks(favoritesResponse);
      setCommentedBooks(commentedResponse);
    } catch (error) {
      console.error('Error fetching user books:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthChecked) {
    // 等待身份验证检查完成
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // 用户未登录，显示提示信息
    return (
      <div className="main-container">
        <div className="content-area">
          <h2>Please log in to view your books.</h2>
        </div>
      </div>
    );
  }

  // 用户已登录，显示书籍列表
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