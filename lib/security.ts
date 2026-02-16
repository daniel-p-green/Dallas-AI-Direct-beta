import { NextResponse } from 'next/server';

function isProductionRuntime() {
  return process.env.NODE_ENV === 'production';
}

export function assertAdminRequest(request: Request): NextResponse | null {
  const configuredToken = process.env.ADMIN_API_TOKEN;

  if (!configuredToken || configuredToken.trim().length === 0) {
    return NextResponse.json(
      { error: 'Admin API is not configured. Set ADMIN_API_TOKEN.' },
      { status: isProductionRuntime() ? 503 : 401 },
    );
  }

  const provided = request.headers.get('x-admin-token') ?? '';
  if (provided !== configuredToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
