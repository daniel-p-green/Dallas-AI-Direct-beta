# UI Mobile Audit (Manual)

This checklist is the demo-readiness proof for mobile QR sanity.
Run on real devices/browsers before any live demo.

## Required coverage
- Browser/device A: iPhone Safari
- Browser/device B: Android Chrome
- Mobile viewport sanity: 375px width behavior
- Privacy sanity: no attendee email appears in public room UI

## iPhone Safari checklist
1. Open the QR code with iPhone Safari and confirm it opens `/signup`.
2. Confirm `/signup` has no horizontal scroll at 375px width.
3. Confirm email helper text is visible near the form submit area.
4. Confirm consent checkbox defaults to unchecked.
5. Submit a valid signup and confirm submit works.
6. Confirm redirect or a clear navigation action to `/room` works.
7. Confirm `/room` shows newest entries first.
8. Confirm `/room` shows `Updated Xs ago`.
9. Confirm LinkedIn icon is visible and clickable.
10. Confirm no email appears anywhere on `/room`.

## Android Chrome checklist
1. Open the QR code with Android Chrome and confirm it opens `/signup`.
2. Confirm `/signup` has no horizontal scroll at 375px width.
3. Confirm email helper text is visible near the form submit area.
4. Confirm consent checkbox defaults to unchecked.
5. Submit a valid signup and confirm submit works.
6. Confirm redirect or a clear navigation action to `/room` works.
7. Confirm `/room` shows newest entries first.
8. Confirm `/room` shows `Updated Xs ago`.
9. Confirm LinkedIn icon is visible and clickable.
10. Confirm no email appears anywhere on `/room`.

## Playwright audit
Automated companion test exists at `tests/ui-mobile-audit.spec.ts`.
It enforces mobile viewport behavior (375x812) and privacy/no-email behavior on room view.
