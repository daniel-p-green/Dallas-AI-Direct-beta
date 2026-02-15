import { NextRequest, NextResponse } from 'next/server';
import { isAuthConfigured, setSessionCookie, verifyAdminCredentials } from '@/lib/auth';

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;

type AttemptState = {
  attempts: number;
  windowStart: number;
};

const loginAttempts = new Map<string, AttemptState>();

function toAttemptKey(request: NextRequest, email: string) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown-ip';
  const ua = request.headers.get('user-agent') ?? 'unknown-agent';
  return `${ip}|${ua}|${email}`;
}

function trackAttempt(key: string, now: number) {
  const current = loginAttempts.get(key);

  if (!current || now - current.windowStart > LOGIN_WINDOW_MS) {
    const next = { attempts: 1, windowStart: now };
    loginAttempts.set(key, next);
    return next;
  }

  const next = { attempts: current.attempts + 1, windowStart: current.windowStart };
  loginAttempts.set(key, next);
  return next;
}

function clearAttempts(key: string) {
  loginAttempts.delete(key);
}

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: 'Auth unavailable' }, { status: 503 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const now = Date.now();
    const key = toAttemptKey(request, email);
    const attemptState = trackAttempt(key, now);

    if (attemptState.attempts > LOGIN_MAX_ATTEMPTS) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }

    const user = await verifyAdminCredentials(email, password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    clearAttempts(key);
    const cookieSet = await setSessionCookie(user);

    if (!cookieSet) {
      return NextResponse.json({ error: 'Auth unavailable' }, { status: 503 });
    }

    return NextResponse.json({ ok: true, user: { email: user.email, role: user.role } });
  } catch {
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 });
  }
}
