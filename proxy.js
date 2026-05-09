import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';


// Define routes that should be accessible without any auth delay
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/explore(.*)",
  "/",
])

// // 1. COMPLETELY IGNORE the root and explore page for Clerk processing
// const isIgnoredRoute = createRouteMatcher([
//   "/",
//   "/explore(.*)",
//   "/((?!api|trpc))(_next|.*\\..*).*"
// ]); 


// Define routes that require a login
const isProtectedRoute = createRouteMatcher([
   "/my-events(.*)",
   "/create-event(.*)",
   "/my-tickets(.*)"
]);



export default clerkMiddleware(async(auth, req)=> {
    // 1. If it's a public route, let the request pass immediately
    if (isPublicRoute(req)) {
        return NextResponse.next();
    }
      // // If ignored, move to the next step instantly without calling Clerk
      // if (isIgnoredRoute(req)) {
      //     return NextResponse.next();
      //   }
    // 2. Otherwise, check for authentication
    const {userId, redirectToSignIn} = await auth();

    // 3. If it's a protected route and no user is logged in, redirect to sign-in
    if (!userId && isProtectedRoute(req)) {
       
        return redirectToSignIn();

    }

    return NextResponse.next()
    // done with middleware, can move forward.
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 