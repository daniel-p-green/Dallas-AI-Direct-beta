# Dallas AI Problem Research (2026-02-15)

## Purpose
Ground Dallas AI Direct Beta requirements in observed Dallas AI community reality, not generic meetup assumptions.

## Sources reviewed
- https://dallas-ai.org/
- https://dallas-ai.org/about/
- https://www.meetup.com/dal-ai/
- https://www.meetup.com/dal-ai/events/312973825/
- https://www.meetup.com/dal-ai/events/313192525/
- https://www.meetup.com/dal-ai/feedback-overview/
- https://www.meetup.com/dal-ai/feedback-overview/attributes/met-new-people/
- https://www.meetup.com/dal-ai/feedback-overview/attributes/not-as-described/
- https://www.meetup.com/dal-ai/feedback-overview/attributes/did-not-meet-anyone/
- https://www.meetup.com/dal-ai/feedback-overview/attributes/was-not-punctual/
- https://dallasinnovates.com/partner/dallas-ai/

## What appears true about Dallas AI
1. Dallas AI is a large nonprofit community (10k+ members) distributed across Meetup + LinkedIn.
2. The org is volunteer-powered and runs frequent educational/professional networking events.
3. Audience mix is broad: executives, practitioners, graduates/students.
4. Program themes emphasize practical implementation, agents, and business impact.

## Evidence signals relevant to product design
- Meetup group page observed on 2026-02-15 shows:
  - ~10,209 members
  - 4.6 rating across 1,063 ratings
  - Recent event attendance examples: 301 attendees, 126 attendees
- Feedback attributes emphasize outcomes that matter:
  - Positive: Engaging, Welcoming host, Met new people, Inclusive attendees, Felt safe
  - Negative (lower count but important): Not as described, Wasn’t punctual, Didn’t meet anyone, Had no impact

## Inferred real problems Dallas AI Direct should solve
1. **In-room visibility at scale**: organizers/facilitators need fast attendee signal when event sizes vary from small workshops to 300+ talks.
2. **Networking outcome quality**: attendees should quickly find relevant people (reduce “didn’t meet anyone” outcomes).
3. **Expectation and trust management**: event surfaces should clearly set context and preserve privacy/safety.
4. **Operational consistency for volunteer teams**: lightweight tooling is needed for repeatable setup, check-in flow, and post-event continuity.
5. **Multi-channel fragmentation**: community touchpoints span Meetup, LinkedIn, and email; event data should stay coherent even when channels differ.

## Product implications
- Keep QR signup extremely fast and mobile-first.
- Keep `email` private by DB boundary, always.
- Add event-session scoping (which event this attendee belongs to).
- Add facilitator-centric networking assist (help-needed/help-offered matching).
- Add trust/abuse protections for high-traffic event bursts.
- Add deterministic runbooks and release gates for volunteer maintainers.
