"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL environment variable");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
const CLERK_STATUS_STORAGE_KEY = "clerkReachabilityStatus";
const CLERK_STATUS_TTL_MS = 5 * 60 * 1000;
const CLERK_PROBE_TIMEOUT_MS = 2500;

const ClerkReachabilityContext = createContext({
  clerkStatus: "unknown",
  isClerkReachable: false,
  isClerkChecking: true,
  retryClerkProbe: () => {},
});

function readStoredClerkStatus() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CLERK_STATUS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.checkedAt > CLERK_STATUS_TTL_MS) return null;
    return parsed.status;
  } catch {
    return null;
  }
}

function writeStoredClerkStatus(status) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CLERK_STATUS_STORAGE_KEY, JSON.stringify({ status, checkedAt: Date.now() }));
  } catch {}
}

// Transparent safe mock auth provider configuration
const useMockAuth = () => {
  return useMemo(() => ({
    isLoading: false,
    isAuthenticated: false,
    getToken: async () => null,
  }), []);
};

// Internal layer to dynamically switch Auth engine without unmounting the parent canvas structure
function ConvexAuthLayer({ isClerkReachable, children }) {
  // Safe extraction allows us to run standard useAuth cleanly
  const clerkAuth = useAuth();
  const mockAuth = useMockAuth();

  // If clerk is down, swap the hook reference directly inside the existing wrapper parameter
  const activeAuthHook = isClerkReachable ? clerkAuth : mockAuth;

  return (
    <ConvexProviderWithClerk client={convex} useAuth={() => activeAuthHook}>
      {children}
    </ConvexProviderWithClerk>
  );
}

export function ConvexClientProvider({ children }) {
  const [clerkStatus, setClerkStatus] = useState("unknown");

  const updateClerkStatus = useCallback((status) => {
    setClerkStatus(status);
    writeStoredClerkStatus(status);
  }, []);

  const probeClerkReachability = useCallback(async () => {
    const probeUrl = process.env.NEXT_PUBLIC_CLERK_PROBE_URL;
    if (!probeUrl) {
      updateClerkStatus("reachable");
      return;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CLERK_PROBE_TIMEOUT_MS);
    try {
      await fetch(probeUrl, { method: "GET", mode: "no-cors", cache: "no-store", signal: controller.signal });
      updateClerkStatus("reachable");
    } catch {
      updateClerkStatus("unreachable");
    } finally {
      clearTimeout(timeoutId);
    }
  }, [updateClerkStatus]);

  useEffect(() => {
    const cachedStatus = readStoredClerkStatus();
    if (cachedStatus) {
      setClerkStatus(cachedStatus);
      return;
    }
    void probeClerkReachability();
  }, [probeClerkReachability]);

  const contextValue = useMemo(() => ({
    clerkStatus,
    isClerkReachable: clerkStatus === "reachable",
    isClerkChecking: clerkStatus === "unknown",
    retryClerkProbe: probeClerkReachability,
  }), [clerkStatus, probeClerkReachability]);

  // Keep a clean single layout structure.
  // ClerkProvider handles being mounted perfectly fine offline as long as its internal components aren't drawn.
  return (
    <ClerkReachabilityContext.Provider value={contextValue}>
      <ClerkProvider appearance={{ theme: shadesOfPurple }}>
        <ConvexAuthLayer isClerkReachable={clerkStatus === "reachable"}>
          {children}
        </ConvexAuthLayer>
      </ClerkProvider>
    </ClerkReachabilityContext.Provider>
  );
}

export function useClerkReachability() {
  return useContext(ClerkReachabilityContext);
}
