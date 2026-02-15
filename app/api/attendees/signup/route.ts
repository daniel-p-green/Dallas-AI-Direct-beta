import { NextResponse } from 'next/server';
import { getDb, hasDatabaseUrl } from '../../../../lib/db/server';

type SignupPayload = {
  name: string;
  email: string;
  linkedin_url: string | null;
  title: string | null;
  company: string | null;
  display_title_company: boolean;
  ai_comfort_level: number;
  help_needed: string[];
  help_offered: string[];
  honeypot: string;
  other_help_needed: string | null;
  other_help_offered: string | null;
};

function normalizeOptionalText(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toStringArray(values: unknown) {
  return Array.isArray(values) ? values.filter((value): value is string => typeof value === 'string') : [];
}

function validate(body: unknown): { ok: true; payload: SignupPayload } | { ok: false; message: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, message: 'Invalid request body.' };
  }

  const source = body as Record<string, unknown>;
  const name = typeof source.name === 'string' ? source.name.trim() : '';
  const email = typeof source.email === 'string' ? source.email.trim() : '';
  const comfort = Number(source.ai_comfort_level);

  if (!name || !email) {
    return { ok: false, message: 'Name and email are required.' };
  }

  if (!Number.isFinite(comfort) || comfort < 1 || comfort > 5) {
    return { ok: false, message: 'AI comfort level must be between 1 and 5.' };
  }

  const honeypot = typeof source.honeypot === 'string' ? source.honeypot.trim() : '';

  return {
    ok: true,
    payload: {
      name,
      email,
      linkedin_url: normalizeOptionalText(source.linkedin_url),
      title: normalizeOptionalText(source.title),
      company: normalizeOptionalText(source.company),
      display_title_company: Boolean(source.display_title_company),
      ai_comfort_level: comfort,
      help_needed: toStringArray(source.help_needed),
      help_offered: toStringArray(source.help_offered),
      honeypot,
      other_help_needed: normalizeOptionalText(source.other_help_needed),
      other_help_offered: normalizeOptionalText(source.other_help_offered)
    }
  };
}

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'Signup unavailable' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const parsed = validate(body);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.message }, { status: 400 });
    }

    const { payload } = parsed;

    if (payload.honeypot.length > 0) {
      return NextResponse.json({ ok: true });
    }

    const db = getDb();

    await db`
      insert into attendees (
        name,
        email,
        linkedin_url,
        title,
        company,
        display_title_company,
        ai_comfort_level,
        help_needed,
        help_offered,
        honeypot,
        other_help_needed,
        other_help_offered
      )
      values (
        ${payload.name},
        ${payload.email},
        ${payload.linkedin_url},
        ${payload.title},
        ${payload.company},
        ${payload.display_title_company},
        ${payload.ai_comfort_level},
        ${payload.help_needed},
        ${payload.help_offered},
        ${payload.honeypot},
        ${payload.other_help_needed},
        ${payload.other_help_offered}
      )
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    const duplicate =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === '23505';

    if (duplicate) {
      return NextResponse.json({ error: 'This email has already been used for signup.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Signup failed. Please try again in a moment.' }, { status: 500 });
  }
}
