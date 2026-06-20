import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function GET(request) {
  try {
    const token = request.cookies.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const dbUser = await convex.query(api.users.getById, { id: payload.userId });

    if (!dbUser) {
      // Create response and drop invalid cookie cleanly across the whole domain
      const response = NextResponse.json({ user: null }, { status: 200 });
      response.cookies.set({ name: "session_token", value: "", path: "/", maxAge: 0 });
      return response;
    }

    // Strip password hashes out so they never touch client-side browsers
    const { passwordHash, ...safeUserData } = dbUser;

    return NextResponse.json({ user: safeUserData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user in /api/auth/me:", error);
    
    const response = NextResponse.json({ user: null }, { status: 200 });
    // CRITICAL FIX: Explicit path target ensures cookie drops correctly
    response.cookies.set({ name: "session_token", value: "", path: "/", maxAge: 0 });
    return response;
  }
}
