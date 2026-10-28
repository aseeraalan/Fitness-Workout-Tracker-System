# Risk and feedback tracker

Owners are **Unassigned** unless a real assignment is recorded. Mitigations marked **proposed** are not claims that they were already applied in production. Status values should be updated from evidence, not from guesswork.

## Initial risks

| ID | Risk | Impact | Likelihood | Proposed mitigation | Owner | Status | Stakeholder feedback | Follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R3-01 | Google-authenticated users cannot save workouts because session identity is not the Mongo user `_id` | High — those users lose a core feature | Medium (reported in Sprint 2 follow-up; reproduced in code as serialize/deserialize accepting non-Mongo ids) | **Proposed and implemented in code:** serialize only a valid Mongo ObjectId; assign workout `owner` from `currentUserId`; add mocked-Google workout tests. Live Google login still needs credentials. | Unassigned | Open until live Google verification; automated mock path covered | | Confirm with a real Google account after OAuth env vars are set |
| R3-02 | Calendar events appear on the wrong day near midnight or month boundaries if stored instants are converted through the local time zone | High — users distrust the calendar | Medium | **Proposed and implemented in code:** store date-only values as UTC midnight of the civil `YYYY-MM-DD`; display that same civil date; cap calendar queries at 45 days; add month-boundary and local-midnight tests | Unassigned | Mitigated in automated tests; not live-verified in every time zone | | Spot-check a date near local midnight during the demo |
| R3-03 | Progress UI is mistaken for a personal record or strength score | Medium — misleading claims | Low | **Proposed:** label values as highest recorded kg per workout; do not use PR/strength language; kg-only units | Unassigned | Proposed labeling is in the UI copy | | |
| R3-04 | Calendar or progress endpoints leak another user’s data if owner scoping is only done in the frontend | High | Low if S3-06 tests pass | **Proposed:** require auth on the API; query `owner: currentUserId(req)` | Unassigned | Covered by API tests | | |

## Additional risks (add as discovered)

| ID | Risk | Impact | Likelihood | Proposed mitigation | Owner | Status | Stakeholder feedback | Follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | Unassigned | | | |

## Stakeholder feedback log

| Date | Stakeholder | Feedback | Response / follow-up | Owner |
| --- | --- | --- | --- | --- |
| | | | | Unassigned |

_Leave blank until real feedback exists._
