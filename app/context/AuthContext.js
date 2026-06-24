"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({
  user: null,
  token: null,
  isLoading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  // 1. Initialize state immediately from localStorage so it doesn't start as null
  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("convex_token") || null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        
        // 2. Fallback check: if API didn't include the token, keep using the one we have
        const activeToken = data.token || localStorage.getItem("convex_token");
        
        if (activeToken) {
          setToken(activeToken);
          localStorage.setItem("convex_token", activeToken);
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem("convex_token");
      }
    } catch (error) {
      console.error("Auth sync error:", error);
      // Don't wipe the local storage token on random network fetch drops
    } finally {
      setIsLoading(false);
    }
  };

  // Run on mount to sync profile data using HTTP cookies
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
