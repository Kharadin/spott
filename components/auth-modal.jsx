"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";


export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {

  const router = useRouter();
  const searchParams = useSearchParams();

    // 1. Capture the 'redirect' param from the URL
  // If no redirect is present (e.g. user clicked login manually), default to /explore
  const redirectTo = searchParams.get("redirect") || "/explore";

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login";
    const payload = isSignUp ? { email, password, name } : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "An error occurred during authentication.");
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("convex_token", data.token);
      }
      
      // Success! Pass user metadata up to the header state layer
      onAuthSuccess(data.user);
            // 2. Redirect the user to their intended destination
      router.push(redirectTo);
      
      // Force a refresh to ensure Server Components recognize the new cookie
      router.refresh(); 

    } catch (err) {
      setError("Cannot communicate with server authentication endpoint.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-xs">
      <div className="bg-white text-black p-6 rounded-lg w-full max-w-sm relative shadow-2xl mx-4">
        <h2 className="text-xl font-bold mb-4">{isSignUp ? "Create an Account" : "Welcome Back"}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border px-3 py-2 rounded text-sm outline-hidden focus:border-purple-500"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded text-sm outline-hidden focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded text-sm outline-hidden focus:border-purple-500"
            />
          </div>

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="w-1/2">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-1/2 bg-purple-600 hover:bg-purple-700 text-white">
              {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </div>
        </form>

        <p className="text-xs text-center text-zinc-500 mt-4">
          {isSignUp ? "Already have an account?" : "New to the platform?"}{" "}
          <button
            type="button"
            onClick={() => { setError(""); setIsSignUp(!isSignUp); }}
            className="text-purple-600 font-semibold hover:underline bg-transparent border-0 p-0 cursor-pointer"
          >
            {isSignUp ? "Log In" : "Register here"}
          </button>
        </p>
      </div>
    </div>
  );
}
