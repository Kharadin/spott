// app/(admin)/admin/layout.js
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const user = useQuery(api.users.getCurrentUser);
  const router = useRouter();

  useEffect(() => {
    // If user is loaded and is NOT an admin, kick them out immediately
    if (user !== undefined && (!user || user.role !== "admin")) {
      router.replace("/"); // Redirect to landing or home page
    }
  }, [user, router]);

  // 1. Show a clean loading state while checking permissions
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-muted-foreground animate-pulse">Verifying credentials...</p>
      </div>
    );
  }

  // 2. If unauthorized, return null while the redirect processes
  if (!user || user.role !== "admin") {
    return null;
  }

  // 3. Render the dashboard layout if the user is verified as an admin
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b bg-white p-4 font-bold shadow-sm text-slate-800">
        🛡️ Admin Control Panel
      </header>
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
