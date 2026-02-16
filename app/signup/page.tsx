import { redirect } from 'next/navigation';
import { SignupForm } from "@/components/signup-form"
import { getSessionUser } from '@/lib/auth';
import { getAttendeeSessionUser, isAttendeeAuthEnabled } from '@/lib/attendee-auth';

export default async function SignupPage() {
  if (isAttendeeAuthEnabled()) {
    const adminUser = await getSessionUser();
    const attendeeUser = adminUser ? null : await getAttendeeSessionUser();

    if (!adminUser && !attendeeUser) {
      redirect('/sign-in?redirect_url=/signup');
    }
  }

  return <SignupForm />
}
