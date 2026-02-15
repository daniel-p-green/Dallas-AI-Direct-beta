# Load and Performance Tests

| ID | Scenario | Expected |
|---|---|---|
| PERF-01 | 50 concurrent signups in 5 minutes | Stable inserts and acceptable latency |
| PERF-02 | Dashboard refresh under active writes | Correct counts and distribution |
| PERF-03 | Realtime failover to polling | Dashboard remains usable |
