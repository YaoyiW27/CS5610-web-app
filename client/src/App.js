import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import SearchBooks from './pages/SearchBooks';
import MyBooks from './pages/MyBooks';
import './App.css';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Publishable Key");
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <div className="App">
          <Header />
          <div className="main-container">
            <Routes>
              <Route path="/" element={<Navigate to="/search" />} />
              <Route path="/search" element={<SearchBooks />} />
              <Route path="/my-books" element={<MyBooks />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ClerkProvider>
  );
}

export default App;