import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

import ExplorePage from "./(public)/explore/page";
import ExploreLayout from "./(public)/explore/layout";



import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";


// Create a read-only HTTP client for server-side fetching
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export const dynamic = "force-dynamic"; // Ensure fresh data on every request

export default async function Page() {
  // 1. Fetch data securely on the server (Bypasses Russian ISP blocks)
  const featuredEvents = await convex.query(api.explore.getFeaturedEvents, { limit: 7 });
  const popularEvents = await convex.query(api.explore.getPopularEvents, { limit: 16 });
  const categoryCounts = await convex.query(api.explore.getCategoryCounts);

  // 2. Pass data as props to the Client Component
  return (
    <ExplorePage 
      initialFeatured={featuredEvents} 
      initialPopular={popularEvents} 
      initialCounts={categoryCounts}
    />
  );
}
