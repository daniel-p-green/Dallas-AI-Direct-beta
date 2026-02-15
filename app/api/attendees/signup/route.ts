import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getDb, hasDatabaseUrl } from '../../../../lib/db/server';
import { getSignupProtectionConfig } from '../../../../lib/signup-protection-config';
import { getActiveEventSession } from '../../../../lib/event-session';

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

type RiskEventType = 'flagged' | 'rate_limited' | 'blocked';

type RiskSignal = {
  riskScore: number;
  triggeredRules: string[];
  malformedPayloadCount: number;
};

type FingerprintWindow = {
  requestTimestamps: number[];
  malformedTimestamps: number[];
};

const fingerprintWindows = new Map<string, FingerprintWindow>();

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

function hashValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return createHash('sha256').update(value).digest('hex');
}

function redactEmail(email: string | null | undefined) {
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

function getFingerprintKey(request: Request, email: string | null) {
  const forwardedFor = request.headers.get('x-forwarded-for') ?? 'unknown-ip';
  const userAgent = request.headers.get('user-agent') ?? 'unknown-agent';
  const emailKey = email ? email.trim().toLowerCase() : 'unknown-email';
  return `${forwardedFor}|${userAgent}|${emailKey}`;
}

function getRequestWindow(fingerprintHash: string, now: number, windowMs: number) {
  const existing = fingerprintWindows.get(fingerprintHash) ?? {
    requestTimestamps: [],
    malformedTimestamps: [],
  };

  existing.requestTimestamps = existing.requestTimestamps.filter((value) => now - value <= windowMs);
  existing.malformedTimestamps = existing.malformedTimestamps.filter((value) => now - value <= windowMs);

  fingerprintWindows.set(fingerprintHash, existing);
  return existing;
}

function validate(body: unknown): { ok: true; payload: SignupPayload } | { ok: false; message: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, message: 'Invalid request body.' };
  }

  const source = body as Record<string, unknown>;
  const name = typeof source.name === 'string' ? source.name.trim() : '';
  const email = typeof source.email === 'string' ? source.email.trim().toLowerCase() : '';
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
      other_help_offered: normalizeOptionalText(source.other_help_offered),
    },
  };
}

function computeRiskSignal(args: {
  honeypotTriggered: boolean;
  requestCountInWindow: number;
  malformedPayloadCountInWindow: number;
  duplicateTriggered: boolean;
}) {
  const config = getSignupProtectionConfig();
  const { weights, thresholds } = config.riskScoring;
  let riskScore = 0;
  const triggeredRules: string[] = [];

  if (args.honeypotTriggered) {
    riskScore += weights.honeypot;
    triggeredRules.push('honeypot');
  }

  if (args.requestCountInWindow >= thresholds.velocityRequestCount) {
    riskScore += weights.velocity;
    triggeredRules.push('velocity');
  }

  if (args.malformedPayloadCountInWindow >= thresholds.malformedPayloadCount) {
    riskScore += weights.malformedPayload;
    triggeredRules.push('malformed_payload_frequency');
  }

  if (args.duplicateTriggered) {
    riskScore += weights.duplicateEmail;
    triggeredRules.push('duplicate_email');
  }

  return {
    riskScore,
    triggeredRules,
    malformedPayloadCount: args.malformedPayloadCountInWindow,
  };
}

function emitSignupSecurityLog(payload: {
  eventType: RiskEventType;
  fingerprintHash: string;
  emailHash: string | null;
  emailRedacted: string | null;
  riskSignal: RiskSignal;
}) {
  console.info(
    JSON.stringify({
      event: 'signup_security',
      eventType: payload.eventType,
      requestFingerprintHash: payload.fingerprintHash,
      emailHash: payload.emailHash,
      emailRedacted: payload.emailRedacted,
      riskScore: payload.riskSignal.riskScore,
      triggeredRules: payload.riskSignal.triggeredRules,
      malformedPayloadCount: payload.riskSignal.malformedPayloadCount,
    }),
  );
}

async function recordRiskEvent(args: {
  db: ReturnType<typeof getDb>;
  eventType: RiskEventType;
  request: Request;
  email: string | null;
  fingerprintHash: string;
  riskSignal: RiskSignal;
  metadata: Record<string, unknown>;
}) {
  const config = getSignupProtectionConfig();
  const emailHash = hashValue(args.email?.trim().toLowerCase() ?? null);
  const emailRedacted = redactEmail(args.email);
  const forwardedFor = args.request.headers.get('x-forwarded-for') ?? null;
  const userAgent = args.request.headers.get('user-agent') ?? null;
  const ipHash = hashValue(forwardedFor);
  const userAgentHash = hashValue(userAgent);
  const payloadShapeHash = hashValue(JSON.stringify(Object.keys(args.metadata).sort()));

  const inserted = await args.db<{ id: string }[]>`
    insert into public.signup_risk_events (
      request_fingerprint_hash,
      email_hash,
      email_redacted,
      ip_hash,
      user_agent_hash,
      risk_score,
      triggered_rules,
      event_type,
      malformed_payload_count,
      payload_shape_hash,
      event_metadata
    )
    values (
      ${args.fingerprintHash},
      ${emailHash},
      ${emailRedacted},
      ${ipHash},
      ${userAgentHash},
      ${Math.min(100, args.riskSignal.riskScore)},
      ${args.riskSignal.triggeredRules},
      ${args.eventType},
      ${args.riskSignal.malformedPayloadCount},
      ${payloadShapeHash},
      ${JSON.stringify(args.metadata)}::jsonb
    )
    returning id
  `;

  const shouldEnqueueModeration =
    args.eventType === 'rate_limited' || args.riskSignal.riskScore >= config.riskScoring.suspiciousScoreThreshold;

  if (shouldEnqueueModeration) {
    await args.db`
      insert into public.signup_moderation_queue (
        risk_event_id,
        request_fingerprint_hash,
        email_hash,
        email_redacted,
        risk_score,
        triggered_rules,
        status
      )
      values (
        ${inserted[0].id},
        ${args.fingerprintHash},
        ${emailHash},
        ${emailRedacted},
        ${Math.min(100, args.riskSignal.riskScore)},
        ${args.riskSignal.triggeredRules},
        'pending'
      )
    `;
  }

  emitSignupSecurityLog({
    eventType: args.eventType,
    fingerprintHash: args.fingerprintHash,
    emailHash,
    emailRedacted,
    riskSignal: args.riskSignal,
  });
}

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'Signup unavailable' }, { status: 503 });
  }

  const config = getSignupProtectionConfig();
  const now = Date.now();

  try {
    const body = await request.json();
    const parsed = validate(body);

    const candidateEmail =
      parsed.ok && typeof parsed.payload.email === 'string' ? parsed.payload.email.trim().toLowerCase() : null;
    const requestFingerprint = getFingerprintKey(request, candidateEmail);
    const requestFingerprintHash = hashValue(requestFingerprint) ?? 'unknown-fingerprint';
    const windowState = getRequestWindow(requestFingerprintHash, now, config.rateLimit.windowMs);
    windowState.requestTimestamps.push(now);

    if (!parsed.ok) {
      windowState.malformedTimestamps.push(now);
      const riskSignal = computeRiskSignal({
        honeypotTriggered: false,
        requestCountInWindow: windowState.requestTimestamps.length,
        malformedPayloadCountInWindow: windowState.malformedTimestamps.length,
        duplicateTriggered: false,
      });

      await recordRiskEvent({
        db: getDb(),
        eventType: 'blocked',
        request,
        email: candidateEmail,
        fingerprintHash: requestFingerprintHash,
        riskSignal,
        metadata: {
          reason: 'validation_failed',
          message: parsed.message,
        },
      });

      return NextResponse.json({ error: parsed.message }, { status: 400 });
    }

    if (windowState.requestTimestamps.length > config.rateLimit.maxRequests) {
      const riskSignal = computeRiskSignal({
        honeypotTriggered: parsed.payload.honeypot.length > 0,
        requestCountInWindow: windowState.requestTimestamps.length,
        malformedPayloadCountInWindow: windowState.malformedTimestamps.length,
        duplicateTriggered: false,
      });

      await recordRiskEvent({
        db: getDb(),
        eventType: 'rate_limited',
        request,
        email: parsed.payload.email,
        fingerprintHash: requestFingerprintHash,
        riskSignal,
        metadata: {
          reason: 'rate_limit_exceeded',
          maxRequests: config.rateLimit.maxRequests,
          windowMs: config.rateLimit.windowMs,
        },
      });

      return NextResponse.json({ error: 'Too many signup attempts. Please try again later.' }, { status: 429 });
    }

    const { payload } = parsed;

    const preInsertRiskSignal = computeRiskSignal({
      honeypotTriggered: payload.honeypot.length > 0,
      requestCountInWindow: windowState.requestTimestamps.length,
      malformedPayloadCountInWindow: windowState.malformedTimestamps.length,
      duplicateTriggered: false,
    });

    if (preInsertRiskSignal.riskScore >= config.riskScoring.suspiciousScoreThreshold || payload.honeypot.length > 0) {
      await recordRiskEvent({
        db: getDb(),
        eventType: payload.honeypot.length > 0 ? 'blocked' : 'flagged',
        request,
        email: payload.email,
        fingerprintHash: requestFingerprintHash,
        riskSignal: preInsertRiskSignal,
        metadata: {
          reason: payload.honeypot.length > 0 ? 'honeypot_triggered' : 'suspicious_risk_score',
          maxRequests: config.rateLimit.maxRequests,
          requestCountInWindow: windowState.requestTimestamps.length,
        },
      });
    }

    if (payload.honeypot.length > 0) {
      return NextResponse.json({ ok: true });
    }

    const db = getDb();
    const activeEvent = await getActiveEventSession(db);

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
        other_help_offered,
        event_id
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
        ${payload.other_help_offered},
        ${activeEvent?.id ?? null}
      )
    `;

    return NextResponse.json({
      ok: true,
      event: activeEvent ? { id: activeEvent.id, slug: activeEvent.slug, name: activeEvent.name } : null,
    });
  } catch (error) {
    const duplicate =
      typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505';

    if (duplicate) {
      const requestFingerprint = getFingerprintKey(request, null);
      const requestFingerprintHash = hashValue(requestFingerprint) ?? 'unknown-fingerprint';
      const windowState = getRequestWindow(requestFingerprintHash, now, config.rateLimit.windowMs);
      const riskSignal = computeRiskSignal({
        honeypotTriggered: false,
        requestCountInWindow: windowState.requestTimestamps.length,
        malformedPayloadCountInWindow: windowState.malformedTimestamps.length,
        duplicateTriggered: true,
      });

      await recordRiskEvent({
        db: getDb(),
        eventType: 'flagged',
        request,
        email: null,
        fingerprintHash: requestFingerprintHash,
        riskSignal,
        metadata: {
          reason: 'duplicate_email_conflict',
        },
      });

      return NextResponse.json({ error: 'This email has already been used for signup.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Signup failed. Please try again in a moment.' }, { status: 500 });
  }
}
