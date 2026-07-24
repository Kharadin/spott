"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
 
if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL environment variable");
}
// FORCE the endpoint cleanly by removing process.env entirely from this instance
const PROXY_URL = "https://proxy.bereg-go.ru";

export const convex = new ConvexReactClient(PROXY_URL);

console.log("CONVEX RUNNING - ENFORCING PROXY DIRECT TO:", PROXY_URL);

export function ConvexClientProvider({ children }) {
  return (
     <ConvexProvider client={convex}>
        {children}
     </ConvexProvider> 
     );
};
