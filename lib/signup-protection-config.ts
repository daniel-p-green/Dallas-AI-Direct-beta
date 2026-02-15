export type SignupProtectionConfig = {
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  riskScoring: {
    weights: {
      honeypot: number;
      velocity: number;
      malformedPayload: number;
      duplicateEmail: number;
    };
    thresholds: {
      velocityRequestCount: number;
      malformedPayloadCount: number;
    };
    suspiciousScoreThreshold: number;
  };
  abuseTelemetry: {
    recordDuplicateAttempts: boolean;
  };
};

type EnvRecord = Record<string, string | undefined>;

type IntegerSettingKey =
  | 'SIGNUP_RATE_LIMIT_WINDOW_MS'
  | 'SIGNUP_RATE_LIMIT_MAX_REQUESTS'
  | 'SIGNUP_RISK_WEIGHT_HONEYPOT'
  | 'SIGNUP_RISK_WEIGHT_VELOCITY'
  | 'SIGNUP_RISK_WEIGHT_MALFORMED_PAYLOAD'
  | 'SIGNUP_RISK_WEIGHT_DUPLICATE_EMAIL'
  | 'SIGNUP_RISK_VELOCITY_REQUEST_THRESHOLD'
  | 'SIGNUP_RISK_MALFORMED_PAYLOAD_THRESHOLD'
  | 'SIGNUP_RISK_SUSPICIOUS_SCORE_THRESHOLD';

type BooleanSettingKey = 'SIGNUP_RECORD_DUPLICATE_ATTEMPTS';

const DEFAULTS = Object.freeze({
  SIGNUP_RATE_LIMIT_WINDOW_MS: 60_000,
  SIGNUP_RATE_LIMIT_MAX_REQUESTS: 10,
  SIGNUP_RISK_WEIGHT_HONEYPOT: 5,
  SIGNUP_RISK_WEIGHT_VELOCITY: 3,
  SIGNUP_RISK_WEIGHT_MALFORMED_PAYLOAD: 2,
  SIGNUP_RISK_WEIGHT_DUPLICATE_EMAIL: 2,
  SIGNUP_RISK_VELOCITY_REQUEST_THRESHOLD: 5,
  SIGNUP_RISK_MALFORMED_PAYLOAD_THRESHOLD: 2,
  SIGNUP_RISK_SUSPICIOUS_SCORE_THRESHOLD: 5,
  SIGNUP_RECORD_DUPLICATE_ATTEMPTS: true,
});

function parseIntegerSetting(
  env: EnvRecord,
  key: IntegerSettingKey,
  options: { min: number; allowZero?: boolean },
  errors: string[],
) {
  const raw = env[key];
  const value = raw === undefined || raw === '' ? DEFAULTS[key] : Number(raw);

  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    errors.push(`${key} must be an integer. Received: ${String(raw)}`);
    return DEFAULTS[key];
  }

  if (!options.allowZero && value < options.min) {
    errors.push(`${key} must be >= ${options.min}. Received: ${value}`);
  }

  if (options.allowZero && value < 0) {
    errors.push(`${key} must be >= 0. Received: ${value}`);
  }

  return value;
}

function parseBooleanSetting(env: EnvRecord, key: BooleanSettingKey, errors: string[]) {
  const raw = env[key];

  if (raw === undefined || raw === '') {
    return DEFAULTS[key];
  }

  const normalized = String(raw).trim().toLowerCase();

  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  errors.push(`${key} must be a boolean (true|false). Received: ${String(raw)}`);
  return DEFAULTS[key];
}

export function createSignupProtectionConfigFromEnv(env: EnvRecord): SignupProtectionConfig {
  const errors: string[] = [];

  const windowMs = parseIntegerSetting(env, 'SIGNUP_RATE_LIMIT_WINDOW_MS', { min: 1 }, errors);
  const maxRequests = parseIntegerSetting(env, 'SIGNUP_RATE_LIMIT_MAX_REQUESTS', { min: 1 }, errors);
  const honeypot = parseIntegerSetting(env, 'SIGNUP_RISK_WEIGHT_HONEYPOT', { min: 0, allowZero: true }, errors);
  const velocity = parseIntegerSetting(env, 'SIGNUP_RISK_WEIGHT_VELOCITY', { min: 0, allowZero: true }, errors);
  const malformedPayload = parseIntegerSetting(
    env,
    'SIGNUP_RISK_WEIGHT_MALFORMED_PAYLOAD',
    { min: 0, allowZero: true },
    errors,
  );
  const duplicateEmail = parseIntegerSetting(
    env,
    'SIGNUP_RISK_WEIGHT_DUPLICATE_EMAIL',
    { min: 0, allowZero: true },
    errors,
  );
  const velocityRequestCount = parseIntegerSetting(
    env,
    'SIGNUP_RISK_VELOCITY_REQUEST_THRESHOLD',
    { min: 1 },
    errors,
  );
  const malformedPayloadCount = parseIntegerSetting(
    env,
    'SIGNUP_RISK_MALFORMED_PAYLOAD_THRESHOLD',
    { min: 1 },
    errors,
  );
  const suspiciousScoreThreshold = parseIntegerSetting(
    env,
    'SIGNUP_RISK_SUSPICIOUS_SCORE_THRESHOLD',
    { min: 1 },
    errors,
  );
  const recordDuplicateAttempts = parseBooleanSetting(env, 'SIGNUP_RECORD_DUPLICATE_ATTEMPTS', errors);

  if (errors.length > 0) {
    throw new Error(`Invalid signup protection configuration:\n- ${errors.join('\n- ')}`);
  }

  return {
    rateLimit: {
      windowMs,
      maxRequests,
    },
    riskScoring: {
      weights: {
        honeypot,
        velocity,
        malformedPayload,
        duplicateEmail,
      },
      thresholds: {
        velocityRequestCount,
        malformedPayloadCount,
      },
      suspiciousScoreThreshold,
    },
    abuseTelemetry: {
      recordDuplicateAttempts,
    },
  };
}

let cachedConfig: SignupProtectionConfig | null = null;

export function getSignupProtectionConfig() {
  if (!cachedConfig) {
    cachedConfig = createSignupProtectionConfigFromEnv(process.env);
  }

  return cachedConfig;
}

export function resetSignupProtectionConfigCacheForTests() {
  cachedConfig = null;
}
