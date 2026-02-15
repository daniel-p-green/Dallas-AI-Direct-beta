import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { emitAttendeeAuthEvent, isAttendeeAuthEnabled, isAttendeeAuthRequired } from '@/lib/attendee-auth';
import { getDb, hasDatabaseUrl } from '@/lib/db/server';

function resolveNextPath(value: string | null) {
  if (!value || !value.startsWith('/')) {
    return '/room';
  }

  return value;
}

function resolvePrimaryEmail(user: {
  primaryEmailAddressId?: string | null;
  emailAddresses?: Array<{ id: string; emailAddress: string }>;
}) {
  if (!Array.isArray(user.emailAddresses) || user.emailAddresses.length === 0) {
    return null;
  }

  if (user.primaryEmailAddressId) {
    const primary = user.emailAddresses.find((value) => value.id === user.primaryEmailAddressId);
    if (primary) {
      return primary.emailAddress;
    }
  }

  return user.emailAddresses[0]?.emailAddress ?? null;
}

export async function GET(request: NextRequest) {
  const nextPath = resolveNextPath(request.nextUrl.searchParams.get('next'));

  if (isAttendeeAuthRequired() && !isAttendeeAuthEnabled()) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (!isAttendeeAuthEnabled()) {
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const authState = await auth();

  if (!authState.userId) {
    emitAttendeeAuthEvent({
      event: 'attendee_auth_magic_link_verify',
      outcome: 'no_session',
      metadata: {
        nextPath,
      },
    });

    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', `${request.nextUrl.origin}/api/auth/attendee/verify-link?next=${encodeURIComponent(nextPath)}`);
    return NextResponse.redirect(signInUrl);
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(authState.userId);
    const email = resolvePrimaryEmail(user);

    const db = getDb();

    const identityRows = await db<{ id: string }[]>`
      insert into public.attendee_identities (
        clerk_user_id,
        email,
        verified_at
      )
      values (
        ${user.id},
        ${email},
        now()
      )
      on conflict (clerk_user_id)
      do update set
        email = excluded.email,
        verified_at = coalesce(public.attendee_identities.verified_at, excluded.verified_at)
      returning id
    `;

    const identityId = identityRows[0]?.id;

    if (identityId && email) {
      await db`
        with candidate as (
          select id
          from public.auth_magic_links
          where email = ${email}
            and consumed_at is null
            and expires_at > now()
          order by created_at desc
          limit 1
        )
        update public.auth_magic_links
        set
          consumed_at = now(),
          identity_id = ${identityId}::uuid
        where id in (select id from candidate)
      `;

      if (authState.sessionId) {
        const configuredSessionTtlDays = Number(process.env.ATTENDEE_SESSION_TTL_DAYS ?? 7);
        const sessionTtlDays = Number.isFinite(configuredSessionTtlDays)
          ? Math.max(1, Math.min(30, Math.floor(configuredSessionTtlDays)))
          : 7;
        await db`
          insert into public.attendee_sessions (
            identity_id,
            clerk_session_id,
            expires_at
          )
          values (
            ${identityId}::uuid,
            ${authState.sessionId},
            now() + make_interval(days => ${sessionTtlDays})
          )
          on conflict (clerk_session_id)
          do update set
            identity_id = excluded.identity_id,
            expires_at = excluded.expires_at,
            revoked_at = null
        `;
      }
    }

    emitAttendeeAuthEvent({
      event: 'attendee_auth_magic_link_verify',
      outcome: 'verified',
      email,
      metadata: {
        clerkUserId: user.id,
        clerkSessionId: authState.sessionId,
      },
    });

    return NextResponse.redirect(new URL(nextPath, request.url));
  } catch {
    emitAttendeeAuthEvent({
      event: 'attendee_auth_magic_link_verify',
      outcome: 'error',
      metadata: {
        reason: 'verify_failed',
      },
    });

    return NextResponse.redirect(new URL('/sign-in?error=verify_failed', request.url));
  }
}
