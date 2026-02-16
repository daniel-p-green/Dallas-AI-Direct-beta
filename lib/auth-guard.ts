import { NextResponse } from 'next/server';
import { getSessionUser, isAuthConfigured, type AdminSessionUser } from '@/lib/auth';

type AdminGuardSuccess = {
  ok: true;
  user: AdminSessionUser;
};

type AdminGuardFailure = {
  ok: false;
  response: NextResponse;
};

export type AdminGuardResult = AdminGuardSuccess | AdminGuardFailure;

export async function requireAdminSession(): Promise<AdminGuardResult> {
  if (!isAuthConfigured()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Auth unavailable. Configure SESSION_SECRET, DATABASE_URL, and seed admin user.' },
        { status: 503 },
      ),
    };
  }

  const user = await getSessionUser();

  if (!user || user.role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { ok: true, user };
}
