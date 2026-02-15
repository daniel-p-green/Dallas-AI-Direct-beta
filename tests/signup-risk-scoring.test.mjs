import test from 'node:test';
import assert from 'node:assert/strict';
import { computeSignupRiskSignal } from '../lib/signup-risk-scoring.mjs';

const config = {
  riskScoring: {
    weights: {
      honeypot: 5,
      velocity: 3,
      malformedPayload: 2,
      duplicateEmail: 2,
    },
    thresholds: {
      velocityRequestCount: 5,
      malformedPayloadCount: 2,
    },
    suspiciousScoreThreshold: 5,
  },
};

test('risk scoring deterministically combines heuristic inputs into numeric score', () => {
  const signal = computeSignupRiskSignal(config, {
    honeypotTriggered: true,
    requestCountInWindow: 7,
    malformedPayloadCountInWindow: 3,
    duplicateTriggered: true,
  });

  assert.equal(signal.riskScore, 12);
  assert.deepEqual(signal.triggeredRules, ['honeypot', 'velocity', 'malformed_payload_frequency', 'duplicate_email']);
  assert.equal(signal.malformedPayloadCount, 3);
});

test('risk scoring only applies configured rules once thresholds are met', () => {
  const signal = computeSignupRiskSignal(config, {
    honeypotTriggered: false,
    requestCountInWindow: 4,
    malformedPayloadCountInWindow: 1,
    duplicateTriggered: false,
  });

  assert.equal(signal.riskScore, 0);
  assert.deepEqual(signal.triggeredRules, []);
  assert.equal(signal.malformedPayloadCount, 1);
});
