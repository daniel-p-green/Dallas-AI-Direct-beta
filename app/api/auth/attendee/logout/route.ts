import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { emitAttendeeAuthEvent, getAttendeeSessionUser, isAttendeeAuthEnabled } from '@/lib/attendee-auth';
import { getDb, hasDatabaseUrl } from '@/lib/db/server';

export async function POST() {
  if (!isAttendeeAuthEnabled()) {
    return NextResponse.json({ ok: true, configured: false });
  }

  const authState = await auth();

  if (!authState.sessionId) {
    return NextResponse.json({ ok: true, configured: true });
  }

  try {
    const attendeeUser = await getAttendeeSessionUser();
    const client = await clerkClient();

    await client.sessions.revokeSession(authState.sessionId);

    if (hasDatabaseUrl()) {
      const db = getDb();
      await db`
        update public.attendee_sessions
        set revoked_at = now()
        where clerk_session_id = ${authState.sessionId}
      `;
    }

    emitAttendeeAuthEvent({
      event: 'attendee_auth_session',
      outcome: 'revoked',
      email: attendeeUser?.email,
      metadata: {
        clerkSessionId: authState.sessionId,
        clerkUserId: attendeeUser?.id,
      },
    });

    return NextResponse.json({ ok: true, configured: true });
  } catch {
    emitAttendeeAuthEvent({
      event: 'attendee_auth_session',
      outcome: 'revoke_failed',
      metadata: {
        clerkSessionId: authState.sessionId,
      },
    });

    return NextResponse.json({ error: 'Unable to logout attendee session.' }, { status: 500 });
  }
}
