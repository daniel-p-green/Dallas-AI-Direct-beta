import { NextResponse } from 'next/server';
import { getAttendeeSessionUser, isAttendeeAuthEnabled, isAttendeeAuthRequired } from '@/lib/attendee-auth';

export async function GET() {
  if (!isAttendeeAuthRequired()) {
    return NextResponse.json({
      required: false,
      configured: false,
      user: null,
    });
  }

  if (!isAttendeeAuthEnabled()) {
    return NextResponse.json({
      required: true,
      configured: false,
      user: null,
    });
  }

  const user = await getAttendeeSessionUser();

  if (!user) {
    return NextResponse.json({
      required: true,
      configured: true,
      user: null,
    });
  }

  return NextResponse.json({
    required: true,
    configured: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
}
