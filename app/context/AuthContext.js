"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Initialize context with default values
const AuthContext = createContext({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      // Fetching from your working API route without caching old states
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth sync error:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Run immediately on mount to check if cookie session token is valid
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for clean access across frontend components
export const useAuth = () => useContext(AuthContext);
