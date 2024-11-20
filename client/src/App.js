import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import SearchBooks from './pages/SearchBooks';
import MyBooks from './pages/MyBooks';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookDetailPage from './pages/BookDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <div className="main-container">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/search" />} />
            <Route path="/search" element={<SearchBooks />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route 
              path="/my-books" 
              element={
                <ProtectedRoute>
                  <MyBooks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/book/:id" 
              element={
                <ProtectedRoute>
                  <BookDetailPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
