import { useState } from 'react';

export function useBooks() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleFavorite = async (bookId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/books/${bookId}/favorite`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }
      
      return await response.json();
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addRating = async (bookId, score) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/books/${bookId}/rate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ score })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add rating');
      }
      
      return await response.json();
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateRating = async (bookId, score) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/books/${bookId}/rate`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ score })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update rating');
      }
      
      return await response.json();
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (bookId, text) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/books/${bookId}/comment`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      return await response.json();
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getFavorites = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/books/user/favorites', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      
      const data = await response.json();
      // Data is already formatted in the backend, return directly
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getBookDetails = async (bookId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/books/${bookId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch book details');
      }
      
      const data = await response.json();
      return {
        ...data,
        volumeInfo: {
          ...data.volumeInfo,
          imageLinks: {
            ...data.volumeInfo?.imageLinks,
            thumbnail: data.dbData?.cover || data.volumeInfo?.imageLinks?.thumbnail
          }
        }
      };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    toggleFavorite,
    addRating,
    updateRating,
    addComment,
    getFavorites,
    getBookDetails
  };
}