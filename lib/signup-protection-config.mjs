const DEFAULTS = Object.freeze({
  SIGNUP_RATE_LIMIT_WINDOW_MS: 60_000,
  SIGNUP_RATE_LIMIT_MAX_REQUESTS: 10,
  SIGNUP_RISK_WEIGHT_HONEYPOT: 5,
  SIGNUP_RISK_WEIGHT_VELOCITY: 3,
  SIGNUP_RISK_WEIGHT_MALFORMED_PAYLOAD: 2,
  SIGNUP_RISK_WEIGHT_DUPLICATE_EMAIL: 2,
  SIGNUP_RISK_SUSPICIOUS_SCORE_THRESHOLD: 5,
});

function parseIntegerSetting(env, key, options, errors) {
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

export function createSignupProtectionConfigFromEnv(env) {
  const errors = [];

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
  const suspiciousScoreThreshold = parseIntegerSetting(
    env,
    'SIGNUP_RISK_SUSPICIOUS_SCORE_THRESHOLD',
    { min: 1 },
    errors,
  );

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
      suspiciousScoreThreshold,
    },
  };
}

let cachedConfig = null;

export function getSignupProtectionConfig() {
  if (!cachedConfig) {
    cachedConfig = createSignupProtectionConfigFromEnv(process.env);
  }

  return cachedConfig;
}

export function resetSignupProtectionConfigCacheForTests() {
  cachedConfig = null;
}
