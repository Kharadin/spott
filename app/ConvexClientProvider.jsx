"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
 
if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL environment variable");
}
// FIX: Using the explicit proxy subdomain endpoint
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://proxy.bereg-go.ru";

const convex = new ConvexReactClient(convexUrl);
export function ConvexClientProvider({ children }) {
  return (
     <ConvexProvider client={convex}>
        {children}
     </ConvexProvider> 
     );
};
