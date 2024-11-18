import React from 'react';

const Header = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <i className="fa-solid fa-book"></i>
                <h1>Bookly</h1>
            </div>
            <div className="navbar-menu">
                <a href="#" className="nav-link active">Search</a>
                <a href="#" className="nav-link">My Books</a>
                <a href="#" className="nav-link">Login</a>
            </div>
        </nav>
    );
}

export default Header;