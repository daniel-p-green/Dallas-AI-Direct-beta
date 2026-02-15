import { NextResponse } from 'next/server';
import { getSessionUser, isAuthConfigured } from '@/lib/auth';
import { getAttendeeSessionUser, isAttendeeAuthEnabled, isAttendeeAuthRequired } from '@/lib/attendee-auth';

export async function GET() {
  const adminConfigured = isAuthConfigured();
  const attendeeRequired = isAttendeeAuthRequired();
  const attendeeConfigured = isAttendeeAuthEnabled();

  const adminUser = adminConfigured ? await getSessionUser() : null;

  if (adminUser) {
    return NextResponse.json({
      configured: true,
      attendee_auth_required: attendeeRequired,
      attendee_auth_configured: attendeeConfigured,
      user: {
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  }

  const attendeeUser = attendeeConfigured ? await getAttendeeSessionUser() : null;

  if (!attendeeUser) {
    return NextResponse.json({
      configured: adminConfigured,
      attendee_auth_required: attendeeRequired,
      attendee_auth_configured: attendeeConfigured,
      user: null,
    });
  }

  return NextResponse.json({
    configured: adminConfigured,
    attendee_auth_required: attendeeRequired,
    attendee_auth_configured: attendeeConfigured,
    user: {
      email: attendeeUser.email,
      role: attendeeUser.role,
    },
  });
}
