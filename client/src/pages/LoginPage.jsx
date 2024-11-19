import React from 'react';
import { Link } from 'react-router-dom';
import '../style/LoginPage.css';

function LoginPage() {
  const handleGoogleLogin = () => {
    // 重定向到 Google OAuth 登录
    window.location.href = 'http://localhost:3001/api/auth/google';
  };

  return (
    <div className="login-page">
      <h2>Sign in to Bookly</h2>
      <button onClick={handleGoogleLogin} className="social-login-button google">
        Continue with Google
      </button>
      <p>
        Not a member? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
}

export default LoginPage;