import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { isAttendeeAuthEnabled, isAttendeeAuthRequired } from '@/lib/attendee-auth';

export default function AttendeeSignInPage() {
  if (!isAttendeeAuthRequired()) {
    return (
      <section className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-5 py-10 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Attendee Auth Is Disabled</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Public beta attendee sign-in is currently disabled. You can continue with open demo mode.
        </p>
        <Link href="/signup" className="btn btn-primary mt-6 w-full">
          Continue to Signup
        </Link>
      </section>
    );
  }

  if (!isAttendeeAuthEnabled()) {
    return (
      <section className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-5 py-10 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Attendee Auth Needs Setup</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Set Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) and reload.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-5 py-10">
      <SignIn
        path="/sign-in"
        routing="path"
        fallbackRedirectUrl="/api/auth/attendee/verify-link?next=/room"
        forceRedirectUrl="/api/auth/attendee/verify-link?next=/room"
        signUpUrl="/sign-up"
      />
    </section>
  );
}
