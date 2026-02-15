import type { SignupProtectionConfig } from './signup-protection-config';

export type SignupRiskInput = {
  honeypotTriggered: boolean;
  requestCountInWindow: number;
  malformedPayloadCountInWindow: number;
  duplicateTriggered: boolean;
};

export type SignupRiskSignal = {
  riskScore: number;
  triggeredRules: string[];
  malformedPayloadCount: number;
};

export function computeSignupRiskSignal(config: SignupProtectionConfig, input: SignupRiskInput): SignupRiskSignal {
  const { weights, thresholds } = config.riskScoring;
  let riskScore = 0;
  const triggeredRules: string[] = [];

  if (input.honeypotTriggered) {
    riskScore += weights.honeypot;
    triggeredRules.push('honeypot');
  }

  if (input.requestCountInWindow >= thresholds.velocityRequestCount) {
    riskScore += weights.velocity;
    triggeredRules.push('velocity');
  }

  if (input.malformedPayloadCountInWindow >= thresholds.malformedPayloadCount) {
    riskScore += weights.malformedPayload;
    triggeredRules.push('malformed_payload_frequency');
  }

  if (input.duplicateTriggered) {
    riskScore += weights.duplicateEmail;
    triggeredRules.push('duplicate_email');
  }

  return {
    riskScore,
    triggeredRules,
    malformedPayloadCount: input.malformedPayloadCountInWindow,
  };
}
