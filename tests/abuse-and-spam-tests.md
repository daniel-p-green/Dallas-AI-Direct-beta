# Abuse and Spam Tests

| ID | Scenario | Expected |
|---|---|---|
| ABUSE-01 | Duplicate email submissions | Constraint blocks duplicate |
| ABUSE-02 | Honeypot bot submission | Request denied |
| ABUSE-03 | Invalid ai_comfort_level | Validation failure |
| ABUSE-04 | Burst traffic from single IP | Throttling activates if configured |
