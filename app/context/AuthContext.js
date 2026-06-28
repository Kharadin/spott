"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthContext = createContext({
  user: null,
  token: null,
  isLoading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  // Initialize state immediately from localStorage so it doesn't start as null
  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("convex_token") || null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      
      if (res.ok) {
        const data = await res.json();
        
        if (data.user) {
          setUser(data.user);
          
          // If API returned a fresh token, store it; otherwise keep the existing one
          const activeToken = data.token || localStorage.getItem("convex_token");
          
          if (activeToken) {
            setToken(activeToken);
            localStorage.setItem("convex_token", activeToken);
          }
        } else {
          // API returned 200 but no user — session_token cookie expired or missing
          // Only clear user state, but KEEP the stored token for Convex mutations
          // The token might still be valid; /api/auth/me might just not have the cookie
          setUser(null);
        }
      } else {
        // Non-200 response — API error, not necessarily an auth failure
        // Don't wipe the token; just log and keep existing state
        console.warn("Auth sync: /api/auth/me returned", res.status);
      }
    } catch (error) {
      console.error("Auth sync error:", error);
      // Network errors — never wipe the token
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run on mount to sync profile data using HTTP cookies
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
