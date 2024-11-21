import { useAuthUser } from "../security/AuthContext";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const { isAuthenticated, logout } = useAuthUser();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <i className="fa-solid fa-book"></i>
        <Link to="/">Bookly</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/search" className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`}>
          Search
        </Link>
        {isAuthenticated && (
          <Link to="/my-books" className={`nav-link ${location.pathname === '/my-books' ? 'active' : ''}`}>
            My Books
          </Link>
        )}
        <div className="auth-buttons">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          ) : (
            <button onClick={logout} className="nav-link">Logout</button>
          )}
        </div>
      </div>
    </nav>
  );
}