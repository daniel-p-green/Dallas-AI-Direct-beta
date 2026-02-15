import { clerkMiddleware } from '@clerk/nextjs/server';

// Clerk middleware hydrates auth context for App Router routes and route handlers.
export default clerkMiddleware(() => {});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/(api|trpc)(.*)'],
};
