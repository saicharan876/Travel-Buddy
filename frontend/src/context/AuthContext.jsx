import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// Create the context
export const AuthContext = createContext(null);

// Create the provider component
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  const isAuthenticated = !!token;
  // Effect to run on initial load and when token changes
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken); // Decode token to get user info
        setUser(decodedUser);
        setToken(storedToken);
      } catch (error) {
        console.error("Invalid token:", error);
        logout(); // Clear invalid token
      }
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    try {
      const decodedUser = jwtDecode(newToken);
      setUser(decodedUser);
    } catch (error) {
      console.error("Failed to decode token on login:", error);
      setUser(null);
    }
  };

  const getUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded.id || decoded._id || null;
    } catch (err) {
      console.error("Invalid token:", err);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const authContextValue = { token, user, login, logout, isAuthenticated, getUserId };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
