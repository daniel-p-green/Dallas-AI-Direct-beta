import { SignUp } from '@clerk/nextjs';
import { isAttendeeAuthEnabled, isAttendeeAuthRequired } from '@/lib/attendee-auth';

export default function AttendeeSignUpPage() {
  if (!isAttendeeAuthRequired() || !isAttendeeAuthEnabled()) {
    return null;
  }

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-5 py-10">
      <SignUp
        path="/sign-up"
        routing="path"
        fallbackRedirectUrl="/api/auth/attendee/verify-link?next=/room"
        forceRedirectUrl="/api/auth/attendee/verify-link?next=/room"
        signInUrl="/sign-in"
      />
    </section>
  );
}
