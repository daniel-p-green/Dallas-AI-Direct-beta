import { NextResponse } from 'next/server';
import { getSessionUser, isAuthConfigured } from '@/lib/auth';

export async function GET() {
  if (!isAuthConfigured()) {
    return NextResponse.json({
      configured: false,
      user: null,
    });
  }

  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({
      configured: true,
      user: null,
    });
  }

  return NextResponse.json({
    configured: true,
    user: {
      email: user.email,
      role: user.role,
    },
  });
}
