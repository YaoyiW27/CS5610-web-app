import React from 'react';
import { Link } from 'react-router-dom';
import '../style/RegisterPage.css';

function RegisterPage() {
  const handleGoogleSignup = () => {
    // 重定向到 Google OAuth 注册
    window.location.href = 'http://localhost:3001/api/auth/google';
  };

  return (
    <div className="register-page">
      <h2>Sign up for Bookly</h2>
      <button onClick={handleGoogleSignup} className="social-login-button google">
        Continue with Google
      </button>
      <p>
        Already a member? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}

export default RegisterPage;