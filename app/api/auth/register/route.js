import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Initialize the Convex HTTP client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    // 1. Basic Format Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // 2. Execute the Convex registration mutation
    const result = await convex.mutation(api.auth.register, {
      email,
      password,
      name,
    });

    // Handle backend rejections (e.g., "Email already registered")
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 409 } // Conflict status code
      );
    }

    // 3. Create a Secure Session Token (Auto-login after registering)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    
    const token = await new SignJWT({ 
      userId: result.userId, 
      tokenIdentifier: result.tokenIdentifier,
      email: email.toLowerCase().trim()
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // 4. Formulate the response with the HTTP-Only cookie
    const response = NextResponse.json({
      success: true,
      message: "Registration and login successful",
      user: {
        id: result.userId,
        email: email,
        name: name,
        tokenIdentifier: result.tokenIdentifier
      }
    });

    // Save cookie securely to browser
    response.cookies.set({
      name: "session_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error) {
    console.error("Critical registration route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
    