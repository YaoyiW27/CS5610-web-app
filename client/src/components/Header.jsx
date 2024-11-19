import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
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
      }
    };

    checkAuth();
  }, [location]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setIsAuthenticated(false);
        navigate('/login');
      } else {
        alert('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('An error occurred during logout.');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <i className="fa-solid fa-book"></i>
        <h1>Bookly</h1>
      </div>
      <div className="navbar-menu">
        <Link
          to="/search"
          className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`}
        >
          Search
        </Link>
        <Link
          to="/my-books"
          className={`nav-link ${location.pathname === '/my-books' ? 'active' : ''}`}
        >
          My Books
        </Link>
        {!isAuthenticated ? (
          <>
            <Link
              to="/login"
              className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
            >
              Register
            </Link>
          </>
        ) : (
          <button onClick={handleLogout} className="nav-link">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Header;