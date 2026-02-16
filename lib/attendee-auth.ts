import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getSessionUser } from '@/lib/auth';

export type AttendeeSessionUser = {
  id: string;
  email: string | null;
  role: 'attendee';
  sessionId: string | null;
};

export type AccessActor =
  | { role: 'admin'; id: string; email: string }
  | { role: 'attendee'; id: string; email: string | null; sessionId: string | null };

export function isClerkConfigured() {
  return Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

export function isAttendeeAuthRequired() {
  return process.env.NEXT_PUBLIC_ATTENDEE_AUTH_REQUIRED === 'true';
}

export function isAttendeeAuthEnabled() {
  return isAttendeeAuthRequired() && isClerkConfigured();
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

export async function getAttendeeSessionUser(): Promise<AttendeeSessionUser | null> {
  if (!isAttendeeAuthEnabled()) {
    return null;
  }

  const authState = await auth();

  if (!authState.userId) {
    return null;
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(authState.userId);

    return {
      id: user.id,
      email: resolvePrimaryEmail(user),
      role: 'attendee',
      sessionId: authState.sessionId ?? null,
    };
  } catch {
    return {
      id: authState.userId,
      email: null,
      role: 'attendee',
      sessionId: authState.sessionId ?? null,
    };
  }
}

export async function resolveAccessActor(): Promise<AccessActor | null> {
  const adminUser = await getSessionUser();
  if (adminUser) {
    return {
      role: 'admin',
      id: adminUser.id,
      email: adminUser.email,
    };
  }

  const attendeeUser = await getAttendeeSessionUser();
  if (attendeeUser) {
    return {
      role: 'attendee',
      id: attendeeUser.id,
      email: attendeeUser.email,
      sessionId: attendeeUser.sessionId,
    };
  }

  return null;
}

export async function requireAttendeeOrAdminApiAccess() {
  if (isAttendeeAuthRequired() && !isClerkConfigured()) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: 'Attendee auth unavailable. Configure Clerk keys for public beta mode.',
        },
        { status: 503 },
      ),
    };
  }

  if (!isAttendeeAuthEnabled()) {
    return {
      ok: true as const,
      actor: null,
    };
  }

  const actor = await resolveAccessActor();
  if (!actor) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return {
    ok: true as const,
    actor,
  };
}

export function redactEmail(email: string | null | undefined) {
  if (!email) {
    return null;
  }

  const normalized = email.trim().toLowerCase();
  const atIndex = normalized.indexOf('@');

  if (atIndex <= 0 || atIndex === normalized.length - 1) {
    return '***';
  }

  return `${normalized[0]}***${normalized.slice(atIndex)}`;
}

export function hashAuthValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return createHash('sha256').update(value).digest('hex');
}

export function emitAttendeeAuthEvent(payload: {
  event: string;
  outcome: string;
  email?: string | null;
  fingerprintHash?: string | null;
  metadata?: Record<string, unknown>;
}) {
  console.info(
    JSON.stringify({
      event: payload.event,
      schemaVersion: '2026-02-15.auth.v1',
      outcome: payload.outcome,
      emailHash: hashAuthValue(payload.email),
      emailRedacted: redactEmail(payload.email),
      fingerprintHash: payload.fingerprintHash ?? null,
      metadata: payload.metadata ?? {},
    }),
  );
}
