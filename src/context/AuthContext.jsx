import React, { createContext, useState, useEffect } from "react";
import { authApi, API_BASE_URL } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await authApi.getMe();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else if (!localStorage.getItem("user")) {
          setUser(null);
        }
      } catch (err) {
        console.warn("Auth session check notice:", err.message);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logoutUser = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedData };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, updateUser, API_URL: API_BASE_URL }}>
      {children}
    </AuthContext.Provider>
  );
};
