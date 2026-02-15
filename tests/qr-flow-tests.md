# QR Flow Tests

| ID | Scenario | Expected |
|---|---|---|
| QR-01 | Valid QR scan -> submit | Attendee appears in dashboard |
| QR-02 | Slow network submit | UI preserves state and retries safely |
| QR-03 | Malformed query param injection | Input validation blocks abuse |
