import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext(null);

function isTokenValid(token) {
  if (!token) {
    return false;
  }
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

function readStoredToken() {
  const stored = localStorage.getItem("token");
  if (isTokenValid(stored)) {
    return stored;
  }
  localStorage.removeItem("token");
  return null;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readStoredToken);
  const [user, setUser] = useState(null);
  const isAuthenticated = !!token;

  useEffect(() => {
    if (token) {
      setUser(jwtDecode(token));
    } else {
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }
    const decoded = jwtDecode(token);
    if (!decoded.exp) {
      return undefined;
    }
    const msLeft = decoded.exp * 1000 - Date.now();
    const timer = setTimeout(() => {
      logout();
    }, Math.max(msLeft, 0));
    return () => clearTimeout(timer);
  }, [token]);

  const login = (newToken) => {
    if (!isTokenValid(newToken)) {
      return;
    }
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const getUserId = () => {
    const current = localStorage.getItem("token");
    if (!isTokenValid(current)) {
      return null;
    }
    const decoded = jwtDecode(current);
    return decoded.id || decoded._id || null;
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
