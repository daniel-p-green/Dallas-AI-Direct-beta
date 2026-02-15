import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getDb, hasDatabaseUrl } from '@/lib/db/server';
import { emitAttendeeAuthEvent, hashAuthValue, isAttendeeAuthEnabled, isAttendeeAuthRequired } from '@/lib/attendee-auth';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 6;
const DEFAULT_MAGIC_LINK_TTL_MINUTES = 15;

type AttemptState = {
  count: number;
  windowStartedAt: number;
};

const attempts = new Map<string, AttemptState>();

function getAttemptKey(request: NextRequest, email: string) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown-ip';
  const ua = request.headers.get('user-agent') ?? 'unknown-agent';
  return `${ip}|${ua}|${email}`;
}

function trackAttempt(key: string, now: number) {
  const existing = attempts.get(key);

  if (!existing || now - existing.windowStartedAt > WINDOW_MS) {
    const next = { count: 1, windowStartedAt: now };
    attempts.set(key, next);
    return next;
  }

  const next = { count: existing.count + 1, windowStartedAt: existing.windowStartedAt };
  attempts.set(key, next);
  return next;
}

function parseEmail(body: unknown) {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const value = (body as Record<string, unknown>).email;
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized.includes('@') || normalized.length > 320) {
    return null;
  }

  return normalized;
}

function getMagicLinkTtlMinutes() {
  const raw = Number(process.env.ATTENDEE_MAGIC_LINK_TTL_MINUTES ?? DEFAULT_MAGIC_LINK_TTL_MINUTES);
  if (!Number.isFinite(raw)) {
    return DEFAULT_MAGIC_LINK_TTL_MINUTES;
  }

  return Math.max(5, Math.min(60, Math.floor(raw)));
}

function getAppBaseUrl(request: NextRequest) {
  const configured = process.env.APP_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  return request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  if (isAttendeeAuthRequired() && !isAttendeeAuthEnabled()) {
    return NextResponse.json(
      { error: 'Attendee auth unavailable. Configure Clerk keys.' },
      { status: 503 },
    );
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const email = parseEmail(body);

    if (!email) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    const now = Date.now();
    const attemptKey = getAttemptKey(request, email);
    const attempt = trackAttempt(attemptKey, now);
    const fingerprintHash = hashAuthValue(attemptKey);

    if (attempt.count > MAX_ATTEMPTS) {
      emitAttendeeAuthEvent({
        event: 'attendee_auth_magic_link_request',
        outcome: 'rate_limited',
        email,
        fingerprintHash,
        metadata: {
          attempts: attempt.count,
          windowMs: WINDOW_MS,
        },
      });

      return NextResponse.json(
        { error: 'Too many attempts. Please try again in a few minutes.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        },
      );
    }

    const db = getDb();
    const rawToken = randomBytes(32).toString('base64url');
    const tokenHash = hashAuthValue(rawToken) ?? `token-${now}`;
    const ttlMinutes = getMagicLinkTtlMinutes();

    await db`
      insert into public.auth_magic_links (
        token_hash,
        email,
        expires_at,
        ip_hash,
        user_agent_hash,
        delivery_provider
      )
      values (
        ${tokenHash},
        ${email},
        now() + make_interval(mins => ${ttlMinutes}),
        ${hashAuthValue(request.headers.get('x-forwarded-for'))},
        ${hashAuthValue(request.headers.get('user-agent'))},
        'clerk'
      )
    `;

    const baseUrl = getAppBaseUrl(request);
    const redirectUrl = `${baseUrl}/api/auth/attendee/verify-link?next=/room`;
    const signInPath = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL?.trim() || '/sign-in';
    const signInUrl = `${baseUrl}${signInPath}?redirect_url=${encodeURIComponent(redirectUrl)}&identifier=${encodeURIComponent(email)}`;

    emitAttendeeAuthEvent({
      event: 'attendee_auth_magic_link_request',
      outcome: 'accepted',
      email,
      fingerprintHash,
      metadata: {
        ttlMinutes,
        deliveryProvider: 'clerk',
      },
    });

    return NextResponse.json({
      ok: true,
      sign_in_url: signInUrl,
      message: 'Continue to sign-in to receive your passwordless email link from Clerk.',
    });
  } catch {
    emitAttendeeAuthEvent({
      event: 'attendee_auth_magic_link_request',
      outcome: 'error',
      metadata: {
        reason: 'request_failed',
      },
    });

    return NextResponse.json({ error: 'Unable to start sign-in.' }, { status: 500 });
  }
}
