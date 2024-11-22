import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import SearchBooks from './pages/SearchBooks';
import MyBooks from './pages/MyBooks';
import Login from './pages/Login';
import Register from './pages/Register';
import BookDetailPage from './pages/BookDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import './style/Layout.css';
import { AuthProvider } from "./security/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Header />
          <div className="main-container">
            <Routes>
              <Route path="/" element={<Navigate to="/search" />} />
              <Route path="/search" element={<SearchBooks />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/my-books" element={<ProtectedRoute><MyBooks /></ProtectedRoute>} />
              <Route path="/book/:id" element={<ProtectedRoute><BookDetailPage /></ProtectedRoute>} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
