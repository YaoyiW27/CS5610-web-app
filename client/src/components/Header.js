import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser, SignInButton, UserButton } from '@clerk/clerk-react';

const Header = () => {
    const { isSignedIn, user } = useUser();
    const location = useLocation();

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
                {isSignedIn && (
                    <Link 
                        to="/my-books" 
                        className={`nav-link ${location.pathname === '/my-books' ? 'active' : ''}`}
                    >
                        My Books
                    </Link>
                )}
                <div className="auth-buttons">
                    {!isSignedIn ? (
                        <SignInButton mode="modal">
                            <button className="nav-link">Sign In</button>
                        </SignInButton>
                    ) : (
                        <UserButton afterSignOutUrl="/search" />
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Header;