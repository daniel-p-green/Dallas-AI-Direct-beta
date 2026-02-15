# Privacy Leak Tests

| ID | Scenario | Expected |
|---|---|---|
| PRIV-01 | Directory API payload inspection | No `email` field present |
| PRIV-02 | Dashboard table rendering | No email column |
| PRIV-03 | Aggregate metrics endpoint | No direct identifier leakage |
| PRIV-04 | Error logs and traces | No sensitive value output |
| PRIV-05 | Match generation API payload and query projection (`tests/match-generation-endpoint.test.mjs`) | No `email` field, no `SELECT *` attendee projection |
| PRIV-06 | Facilitator queue API payload and query projection (`tests/facilitator-queue-endpoint.test.mjs`) | No `email` field, no over-broad attendee selects |
| PRIV-07 | Match decision API payload and query projection (`tests/match-decision-endpoint.test.mjs`) | No `email` field, no over-broad attendee selects/returns |
| PRIV-08 | Admin match review UI rendering (`tests/admin-review-ui.test.mjs`) | No private-field rendering (`email`, help arrays) |
