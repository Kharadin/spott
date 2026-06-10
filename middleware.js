import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';


// Define routes that require a login
const isProtectedRoute = createRouteMatcher([
   "/my-events(.*)",
   "/create-event(.*)",
   "/my-tickets(.*)"
]);



export default clerkMiddleware(async(auth, req)=> {
    // Skip Clerk auth lookup for all non-protected routes.
    // This keeps public pages accessible when Clerk is unreachable.
    if (!isProtectedRoute(req)) {
        return NextResponse.next();
    }

    // Authenticate only protected routes.
    const {userId, redirectToSignIn} = await auth();
    if (!userId) {
       
        return redirectToSignIn();

    }

    return NextResponse.next()
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 