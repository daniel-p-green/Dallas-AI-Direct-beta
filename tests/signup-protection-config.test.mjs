import test from 'node:test';
import assert from 'node:assert/strict';

import { createSignupProtectionConfigFromEnv } from '../lib/signup-protection-config.mjs';

test('uses deterministic defaults when env overrides are absent', () => {
  const config = createSignupProtectionConfigFromEnv({});

  assert.deepEqual(config, {
    rateLimit: {
      windowMs: 60_000,
      maxRequests: 10,
    },
    riskScoring: {
      weights: {
        honeypot: 5,
        velocity: 3,
        malformedPayload: 2,
        duplicateEmail: 2,
      },
      suspiciousScoreThreshold: 5,
    },
  });
});

test('parses integer env overrides for rate limits and heuristic thresholds', () => {
  const config = createSignupProtectionConfigFromEnv({
    SIGNUP_RATE_LIMIT_WINDOW_MS: '120000',
    SIGNUP_RATE_LIMIT_MAX_REQUESTS: '25',
    SIGNUP_RISK_WEIGHT_HONEYPOT: '8',
    SIGNUP_RISK_WEIGHT_VELOCITY: '6',
    SIGNUP_RISK_WEIGHT_MALFORMED_PAYLOAD: '4',
    SIGNUP_RISK_WEIGHT_DUPLICATE_EMAIL: '3',
    SIGNUP_RISK_SUSPICIOUS_SCORE_THRESHOLD: '9',
  });

  assert.equal(config.rateLimit.windowMs, 120_000);
  assert.equal(config.rateLimit.maxRequests, 25);
  assert.equal(config.riskScoring.weights.honeypot, 8);
  assert.equal(config.riskScoring.weights.velocity, 6);
  assert.equal(config.riskScoring.weights.malformedPayload, 4);
  assert.equal(config.riskScoring.weights.duplicateEmail, 3);
  assert.equal(config.riskScoring.suspiciousScoreThreshold, 9);
});

test('fails fast with explicit error details for invalid env values', () => {
  assert.throws(
    () =>
      createSignupProtectionConfigFromEnv({
        SIGNUP_RATE_LIMIT_MAX_REQUESTS: 'abc',
        SIGNUP_RISK_WEIGHT_VELOCITY: '-1',
      }),
    (error) => {
      assert.match(error.message, /Invalid signup protection configuration/);
      assert.match(error.message, /SIGNUP_RATE_LIMIT_MAX_REQUESTS must be an integer/);
      assert.match(error.message, /SIGNUP_RISK_WEIGHT_VELOCITY must be >= 0/);
      return true;
    },
  );
});
