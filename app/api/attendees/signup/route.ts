import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getDb, hasDatabaseUrl } from '../../../../lib/db/server';
import { getSignupProtectionConfig } from '../../../../lib/signup-protection-config';
import { computeSignupRiskSignal, type SignupRiskSignal } from '../../../../lib/signup-risk-scoring';
import { resolveActiveEventSession } from '../../../../lib/event-session';
import { requireAttendeeOrAdminApiAccess } from '../../../../lib/attendee-auth';

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
type TrustDecision = 'allow' | 'flag' | 'block';

type FingerprintWindow = {
  requestTimestamps: number[];
  malformedTimestamps: number[];
};

type RateLimitSnapshot = {
  limit: number;
  remaining: number;
  resetAtEpochMs: number;
  retryAfterSeconds: number;
  isLimited: boolean;
};

const fingerprintWindows = new Map<string, FingerprintWindow>();

function normalizeOptionalText(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeSafeLinkedinUrl(value: unknown): { ok: true; url: string | null } | { ok: false } {
  if (typeof value !== 'string') {
    return { ok: true, url: null };
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    return { ok: true, url: null };
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { ok: false };
    }

    return { ok: true, url: parsed.toString() };
  } catch {
    return { ok: false };
  }
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

function createRateLimitSnapshot(windowState: FingerprintWindow, now: number, windowMs: number, limit: number): RateLimitSnapshot {
  const oldestTimestamp = windowState.requestTimestamps[0] ?? now;
  const resetAtEpochMs = oldestTimestamp + windowMs;
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAtEpochMs - now) / 1000));

  return {
    limit,
    remaining: Math.max(0, limit - windowState.requestTimestamps.length),
    resetAtEpochMs,
    retryAfterSeconds,
    isLimited: windowState.requestTimestamps.length > limit,
  };
}

function getRateLimitHeaders(snapshot: RateLimitSnapshot) {
  return {
    'X-RateLimit-Limit': String(snapshot.limit),
    'X-RateLimit-Remaining': String(snapshot.remaining),
    'X-RateLimit-Reset': String(Math.floor(snapshot.resetAtEpochMs / 1000)),
    'Retry-After': String(snapshot.retryAfterSeconds),
  };
}

function toEpochMs(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isWithinCheckInWindow(args: {
  nowEpochMs: number;
  checkInWindowStart: string | null;
  checkInWindowEnd: string | null;
}) {
  const windowStart = toEpochMs(args.checkInWindowStart);
  const windowEnd = toEpochMs(args.checkInWindowEnd);

  if (windowStart !== null && args.nowEpochMs < windowStart) {
    return false;
  }

  if (windowEnd !== null && args.nowEpochMs > windowEnd) {
    return false;
  }

  return true;
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
  const normalizedLinkedinUrl = normalizeSafeLinkedinUrl(source.linkedin_url);

  if (!normalizedLinkedinUrl.ok) {
    return { ok: false, message: 'LinkedIn URL must use http or https.' };
  }

  return {
    ok: true,
    payload: {
      name,
      email,
      linkedin_url: normalizedLinkedinUrl.url,
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

function emitSignupTrustDecisionLog(payload: {
  decision: TrustDecision;
  routeOutcome: string;
  fingerprintHash: string;
  emailHash: string | null;
  emailRedacted: string | null;
  ipHash: string | null;
  userAgentHash: string | null;
  riskSignal: SignupRiskSignal;
  metadata?: Record<string, unknown>;
}) {
  console.info(
    JSON.stringify({
      event: 'signup_trust_decision',
      schemaVersion: '2026-02-15.v1',
      route: '/api/attendees/signup',
      decision: payload.decision,
      routeOutcome: payload.routeOutcome,
      requestFingerprintHash: payload.fingerprintHash,
      emailHash: payload.emailHash,
      emailRedacted: payload.emailRedacted,
      ipHash: payload.ipHash,
      userAgentHash: payload.userAgentHash,
      riskScore: payload.riskSignal.riskScore,
      triggeredRules: payload.riskSignal.triggeredRules,
      malformedPayloadCount: payload.riskSignal.malformedPayloadCount,
      metadata: payload.metadata ?? {},
    }),
  );
}

async function recordRiskEvent(args: {
  db: ReturnType<typeof getDb>;
  eventType: RiskEventType;
  request: Request;
  email: string | null;
  fingerprintHash: string;
  riskSignal: SignupRiskSignal;
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

  emitSignupTrustDecisionLog({
    decision: args.eventType === 'flagged' ? 'flag' : 'block',
    routeOutcome: String(args.metadata.reason ?? args.eventType),
    fingerprintHash: args.fingerprintHash,
    emailHash,
    emailRedacted,
    ipHash,
    userAgentHash,
    riskSignal: args.riskSignal,
    metadata: args.metadata,
  });
}

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'Signup unavailable' }, { status: 503 });
  }

  const access = await requireAttendeeOrAdminApiAccess();
  if (!access.ok) {
    return access.response;
  }

  const config = getSignupProtectionConfig();
  const now = Date.now();
  let signupEmailForTelemetry: string | null = null;

  try {
    const body = await request.json();
    const parsed = validate(body);

    const candidateEmail =
      parsed.ok && typeof parsed.payload.email === 'string' ? parsed.payload.email.trim().toLowerCase() : null;
    const requestFingerprint = getFingerprintKey(request, candidateEmail);
    const requestFingerprintHash = hashValue(requestFingerprint) ?? 'unknown-fingerprint';
    const windowState = getRequestWindow(requestFingerprintHash, now, config.rateLimit.windowMs);
    windowState.requestTimestamps.push(now);
    const rateLimitSnapshot = createRateLimitSnapshot(
      windowState,
      now,
      config.rateLimit.windowMs,
      config.rateLimit.maxRequests,
    );

    if (!parsed.ok) {
      windowState.malformedTimestamps.push(now);
      const riskSignal = computeSignupRiskSignal(config, {
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

    if (rateLimitSnapshot.isLimited) {
      const riskSignal = computeSignupRiskSignal(config, {
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
          resetAtEpochMs: rateLimitSnapshot.resetAtEpochMs,
        },
      });

      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitSnapshot),
        },
      );
    }

    const { payload } = parsed;
    signupEmailForTelemetry = payload.email;

    const preInsertRiskSignal = computeSignupRiskSignal(config, {
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
    const activeEvent = await resolveActiveEventSession(db);

    if (
      activeEvent &&
      !isWithinCheckInWindow({
        nowEpochMs: now,
        checkInWindowStart: activeEvent.check_in_window_start,
        checkInWindowEnd: activeEvent.check_in_window_end,
      })
    ) {
      return NextResponse.json(
        {
          error: 'Check-in is closed for the active event session.',
          code: 'CHECK_IN_WINDOW_CLOSED',
        },
        { status: 403 },
      );
    }

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

    emitSignupTrustDecisionLog({
      decision: 'allow',
      routeOutcome: 'signup_created',
      fingerprintHash: requestFingerprintHash,
      emailHash: hashValue(payload.email),
      emailRedacted: redactEmail(payload.email),
      ipHash: hashValue(request.headers.get('x-forwarded-for') ?? null),
      userAgentHash: hashValue(request.headers.get('user-agent') ?? null),
      riskSignal: preInsertRiskSignal,
      metadata: {
        activeEventId: activeEvent?.id ?? null,
      },
    });

    return NextResponse.json({
      ok: true,
      event: activeEvent ? { id: activeEvent.id, slug: activeEvent.slug, name: activeEvent.name } : null,
    });
  } catch (error) {
    const duplicate =
      typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505';

    if (duplicate) {
      const requestFingerprint = getFingerprintKey(request, signupEmailForTelemetry);
      const requestFingerprintHash = hashValue(requestFingerprint) ?? 'unknown-fingerprint';
      const windowState = getRequestWindow(requestFingerprintHash, now, config.rateLimit.windowMs);
      const riskSignal = computeSignupRiskSignal(config, {
        honeypotTriggered: false,
        requestCountInWindow: windowState.requestTimestamps.length,
        malformedPayloadCountInWindow: windowState.malformedTimestamps.length,
        duplicateTriggered: true,
      });

      if (config.abuseTelemetry.recordDuplicateAttempts) {
        await recordRiskEvent({
          db: getDb(),
          eventType: 'flagged',
          request,
          email: signupEmailForTelemetry,
          fingerprintHash: requestFingerprintHash,
          riskSignal,
          metadata: {
            reason: 'duplicate_email_conflict',
          },
        });
      } else {
        emitSignupTrustDecisionLog({
          decision: 'flag',
          routeOutcome: 'duplicate_email_conflict',
          fingerprintHash: requestFingerprintHash,
          emailHash: hashValue(signupEmailForTelemetry),
          emailRedacted: redactEmail(signupEmailForTelemetry),
          ipHash: hashValue(request.headers.get('x-forwarded-for') ?? null),
          userAgentHash: hashValue(request.headers.get('user-agent') ?? null),
          riskSignal,
          metadata: {
            reason: 'duplicate_email_conflict',
            telemetryRecorded: false,
          },
        });
      }

      return NextResponse.json({ error: 'This email has already been used for signup.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Signup failed. Please try again in a moment.' }, { status: 500 });
  }
}
