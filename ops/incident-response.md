# Incident Response

## Severity Levels
- Sev-1: Confirmed sensitive data exposure.
- Sev-2: Security control failure without confirmed leak.
- Sev-3: Reliability degradation with preserved privacy.

## Immediate Actions
1. Freeze public directory output if leak suspected.
2. Disable affected endpoint or view route.
3. Preserve logs and query history for forensic review.
4. Notify internal owner and security lead.

## Containment Playbook
- Rotate exposed credentials if needed.
- Patch policy or query path.
- Re-run privacy and RLS test plans.
- Re-enable service only after validation passes.

## Communication Rules
- Use factual updates.
- Avoid speculative root-cause statements.
- Exclude sensitive data from all status messages.
