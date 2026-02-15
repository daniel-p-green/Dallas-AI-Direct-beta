# Auth and Session Tests

| ID | Scenario | Expected |
|---|---|---|
| AUTH-01 | Alpha password gate bypass attempt | Convenience gate behavior enforced |
| AUTH-02 | Direct DB access without policy | Access denied |
| AUTH-03 | Session expiration handling | User receives clean retry flow |
