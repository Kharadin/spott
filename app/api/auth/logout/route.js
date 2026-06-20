import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.set({
      name: "session_token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Clears instantly
    });

    return response;
  } catch (error) {
    console.error("Logout route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during logout" },
      { status: 500 }
    );
  }
}
