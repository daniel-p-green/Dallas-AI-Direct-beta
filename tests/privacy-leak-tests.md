# Privacy Leak Tests

| ID | Scenario | Expected |
|---|---|---|
| PRIV-01 | Directory API payload inspection | No `email` field present |
| PRIV-02 | Dashboard table rendering | No email column |
| PRIV-03 | Aggregate metrics endpoint | No direct identifier leakage |
| PRIV-04 | Error logs and traces | No sensitive value output |
