import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function GET(request) {
  try {
    const token = request.cookies.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Fetch the actual record from Convex to get location, interests, etc.
    const dbUser = await convex.query(api.users.getById, { id: payload.userId });

    if (!dbUser) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user: dbUser }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user in /api/auth/me:", error);
    // If the token is invalid or expired, clear the cookie
    const response = NextResponse.json({ user: null }, { status: 200 });
    response.cookies.delete("session_token");
    return response;
  }
}