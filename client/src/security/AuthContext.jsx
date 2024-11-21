import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/me`, {
          credentials: "include",
        });
        if (response.ok) {
          const userData = await response.json();
          setIsAuthenticated(true);
          setUser(userData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [API_BASE_URL]);

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const userData = await response.json();
      setIsAuthenticated(true);
      setUser(userData);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || "Login failed");
    }
  };

  const register = async (email, password, displayName) => {
    const response = await fetch(`${API_BASE_URL}/register`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, displayName }), 
    });

    if (response.ok) {
      const userData = await response.json();
      setIsAuthenticated(true);
      setUser(userData);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || "Registration failed");
    }
  };

  const logout = async () => {
    await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthUser = () => useContext(AuthContext);