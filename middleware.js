import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

/**
 * Custom Middleware for Email-based Auth
 * After applying this, rename this file to middleware.js
 */
export async function middleware(request) {
  const { nextUrl, cookies } = request;
  const path = nextUrl.pathname;

  // 1. Define routes that do NOT require authentication
  const publicRoutes = [
    "/",
    "/explore",
    "/events",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/logout"
  ];

  const isPublic = publicRoutes.some((route) => 
    path === route || path.startsWith(`${route}/`)
  );

  // #region agent log
  // fetch('http://127.0.0.1:7702/ingest/db15b427-9efe-4370-be8b-f9dc44e66b0e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'cb2d6d'},body:JSON.stringify({sessionId:'cb2d6d',location:'middleware.js:25',message:'middleware route check',data:{path,isPublic,hasToken:!!cookies.get("session_token")?.value},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  if (isPublic) {
    return NextResponse.next();
  }

  // 2. Retrieve the session token from cookies
  const token = cookies.get("session_token")?.value;

  if (!token) {
    // No sign-in page exists, so redirect to home with a trigger for the AuthModal
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("showLogin", "true");
    loginUrl.searchParams.set("redirect", path); // Keep track of where they wanted to go
    // #region agent log
    // fetch('http://127.0.0.1:7702/ingest/db15b427-9efe-4370-be8b-f9dc44e66b0e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'cb2d6d'},body:JSON.stringify({sessionId:'cb2d6d',location:'middleware.js:37',message:'middleware redirect to showLogin',data:{fromPath:path,redirectTo:loginUrl.toString()},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return NextResponse.redirect(loginUrl);
  }

  try {
    // 3. Verify the JWT using your secret
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth verification failed:", error.message);
    // Token is invalid or expired, clear it and trigger login modal on home
    const response = NextResponse.redirect(new URL("/?showLogin=true", request.url));
    response.cookies.delete("session_token");
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for API routes, static assets, and files with extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}; 