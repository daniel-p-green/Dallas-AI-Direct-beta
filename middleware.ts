import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

const attendeeAuthRequired = process.env.NEXT_PUBLIC_ATTENDEE_AUTH_REQUIRED === 'true';
const hasClerkKeys =
  typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'string' &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 0 &&
  typeof process.env.CLERK_SECRET_KEY === 'string' &&
  process.env.CLERK_SECRET_KEY.length > 0;

// Only activate Clerk middleware when attendee auth is enabled and credentials exist.
export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!attendeeAuthRequired || !hasClerkKeys) {
    return NextResponse.next();
  }

  const { clerkMiddleware } = await import('@clerk/nextjs/server');
  const clerkHandler = clerkMiddleware(() => {});
  return clerkHandler(request, event);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/(api|trpc)(.*)'],
};
