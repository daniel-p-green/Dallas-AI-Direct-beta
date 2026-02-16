import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getDb, hasDatabaseUrl } from '@/lib/db/server';

const SESSION_COOKIE = 'dai_admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

type AdminUserRow = {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  is_active: boolean;
};

export type AdminSessionUser = {
  id: string;
  email: string;
  role: 'admin';
};

type SessionPayload = AdminSessionUser & {
  iat: number;
  exp: number;
  v: 1;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET?.trim();

  if (!secret || secret.length < 32) {
    return null;
  }

  return secret;
}

function signPayload(payload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function isSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);

  if (aBuf.length !== bBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuf, bBuf);
}

function toToken(payload: SessionPayload, secret: string) {
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = signPayload(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

function parseToken(token: string, secret: string): SessionPayload | null {
  const parts = token.split('.');

  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, signature] = parts;
  const expectedSignature = signPayload(encodedPayload, secret);

  if (!isSafeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as SessionPayload;

    if (payload.v !== 1) {
      return null;
    }

    if (payload.exp <= Date.now()) {
      return null;
    }

    if (payload.role !== 'admin') {
      return null;
    }

    if (!payload.id || !payload.email) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function isAuthConfigured() {
  return Boolean(getSessionSecret() && hasDatabaseUrl());
}

export async function verifyAdminCredentials(email: string, password: string): Promise<AdminSessionUser | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !hasDatabaseUrl()) {
    return null;
  }

  const db = getDb();
  const rows = await db<AdminUserRow[]>`
    select id::text as id, email, password_hash, role, is_active
    from public.admin_users
    where email = ${normalizedEmail}
    limit 1
  `;

  if (rows.length !== 1) {
    return null;
  }

  const user = rows[0];

  if (!user.is_active || user.role !== 'admin') {
    return null;
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: 'admin',
  };
}

export async function setSessionCookie(user: AdminSessionUser) {
  const secret = getSessionSecret();

  if (!secret) {
    return false;
  }

  const payload: SessionPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    v: 1,
  };

  const token = toToken(payload, secret);
  const store = await cookies();

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return true;
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function getSessionUser(): Promise<AdminSessionUser | null> {
  const secret = getSessionSecret();

  if (!secret) {
    return null;
  }

  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const payload = parseToken(token, secret);

  if (!payload) {
    return null;
  }

  return {
    id: payload.id,
    email: payload.email,
    role: payload.role,
  };
}
