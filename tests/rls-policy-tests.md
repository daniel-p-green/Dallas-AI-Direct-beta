# RLS Policy Tests

| ID | Scenario | Expected |
|---|---|---|
| RLS-01 | anon inserts valid attendee | Insert succeeds |
| RLS-02 | anon selects from `attendees` | Select denied |
| RLS-03 | anon selects from `attendees_public` | Select succeeds without email |
| RLS-04 | authenticated selects from `attendees` | Select denied unless staff policy applies |
| RLS-05 | insert with honeypot filled | Insert denied |
