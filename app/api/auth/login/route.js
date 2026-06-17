import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Initialize the Convex HTTP client to execute mutations outside the standard React loop
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Core Protection Check: Basic format validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // 2. Execute your diagram-accurate Convex authentication mutation
    const result = await convex.mutation(api.auth.login, { email, password });

    // Handle precise backend logic rejections ("Wait 30 seconds", "Account Blocked", etc.)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }

    // 3. Create a Secure Session Token using jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    
    // Embed the unique identifiers into the signed token payload
    const token = await new SignJWT({ 
      userId: result.userId, 
      tokenIdentifier: result.tokenIdentifier,
      email: email.toLowerCase().trim()
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d") // Token remains valid for 7 days
      .sign(secret);

    // 4. Formulate the response with an HTTP-Only secure cookie structure
    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        id: result.userId,
        email: email,
        tokenIdentifier: result.tokenIdentifier
      }
    });

    // Save the token using secure production settings
    response.cookies.set({
      name: "session_token",
      value: token,
      httpOnly: true, // Prevents cross-site scripting (XSS) access via JavaScript
      secure: process.env.NODE_ENV === "production", // Forces HTTPS access in deployment
      sameSite: "lax", // Protects against Cross-Site Request Forgery (CSRF)
      path: "/", // Valid across your entire domain scope
      maxAge: 60 * 60 * 24 * 7 // Sets expiration to exactly 7 days in seconds
    });

    return response;

  } catch (error) {
    console.error("Critical login route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal authentication server error" },
      { status: 500 }
    );
  }
}
