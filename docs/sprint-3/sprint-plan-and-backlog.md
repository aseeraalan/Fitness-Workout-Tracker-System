# Sprint 3 plan and product backlog

**Sprint:** 3  
**Planned calendar:** 26 October 2026 – 8 November 2026 (two course weeks beginning 26 October and 2 November 2026)  
**Estimate unit:** person-hours (not story points)  
**Owner fields:** Unassigned (no recorded team assignments in this repository)  
**Scope source:** **Proposed.** No agreed Sprint 3 backlog was present in the repository. The IDs below are the proposed Sprint 3 items from the brief (S3-01–S3-07) plus proposed course-documentation items (S3-08–S3-11).

Diet planning, social features, workout templates, and advanced analytics remain **out of this sprint**.

## Sprint goal

Allow every authenticated user, including Google-authenticated users, to save and manage workouts, view scheduled and completed workouts in a calendar, and see basic progress over time.

## Selected product backlog items

Statuses below are based on source in this branch and the acceptance criteria. They are **not** a claim that the whole sprint is closed: Daily Scrum records, stakeholder feedback, and a team retrospective still need human input. Automated verification is recorded in [test-report.md](./test-report.md).

| ID | PBI | Priority | Estimate (h) | Owner | Status |
| --- | --- | --- | ---: | --- | --- |
| S3-01 | Diagnose and fix Google account workout logging | Must | 6 | Unassigned | See TEST-REPORT |
| S3-02 | Create a workout calendar interface | Must | 8 | Unassigned | See TEST-REPORT |
| S3-03 | Connect the calendar to existing data | Must | 5 | Unassigned | See TEST-REPORT |
| S3-04 | Manage sessions and workouts from the calendar | Must | 5 | Unassigned | See TEST-REPORT |
| S3-05 | Add basic workout progress tracking | Must | 6 | Unassigned | See TEST-REPORT |
| S3-06 | Validation and security | Must | 4 | Unassigned | See TEST-REPORT |
| S3-07 | Automated testing | Must | 8 | Unassigned | See TEST-REPORT |
| S3-08 | Sprint plan, Gantt, burndown, EVM, Scrum, risks | Must (course) | 4 | Unassigned | Drafted in `docs/sprint-3/` |
| S3-09 | Test report of commands actually run | Must (course) | 2 | Unassigned | Filled in [test-report.md](./test-report.md) |
| S3-10 | Sprint Review + stakeholder feedback capture | Must (course) | 1 | Unassigned | Template only; no review meeting recorded |
| S3-11 | Retrospective template + next actions | Must (course) | 1 | Unassigned | Observed code notes drafted; team reflection pending |

**Total planned work:** 50 person-hours.

This total is an independent Sprint 3 estimate. It does **not** reuse Sprint 2’s PV of 48 hours or Sprint 2’s schedule total of 53 planned person-hours. Those two Sprint 2 figures disagree with each other; neither is carried forward as this sprint’s budget.

## Note on Sprint 2 history / progress tracking

Sprint 2 delivered **workout history** (S2-03: owner-scoped list, date filter, pagination). The Sprint 2 remaining-backlog row **F-03** is labeled “Advanced analytics and progress charts” and is marked **Later / out of Sprint 2**.

The Sprint 2 report therefore lists history work as selected and progress/analytics as later, but it does **not** clearly establish whether any progress-tracking UI or API was completed. Inspection of the Sprint 2 codebase found:

- Workout create / read / update / delete and history list: implemented
- No progress endpoint, no progress page, and no personal-record calculation: **not implemented** before this sprint

S3-05 adds **basic** progress from saved workout records (workout count, highest kg per workout for a selected exercise). It is not F-03 advanced analytics.

## Acceptance criteria

### S3-01 Google account workout logging

- Google-authenticated and local users can create, view, edit, and delete their own workouts.
- Session identity is the MongoDB user `_id`, not a Google profile id.
- Accounts are **not** linked automatically because emails match.
- Public JSON does not include `googleId` or password hashes.
- Regression tests cover both account types and cross-user isolation.
- Live Google login is **not** claimed tested unless real credentials are used. Application-side flow is tested with the existing mocked Google provider (`POST /api/auth/google/mock` in test only).

### S3-02 Calendar interface

- Authenticated calendar page shows one month, previous/next month, and Today.
- Scheduled gym sessions and logged workouts appear on their civil dates.
- Labels and a legend distinguish sessions from workouts in addition to colour.
- Empty day state, loading, and error states exist.
- Selecting a day shows that day’s items.
- Keyboard arrow navigation and roving tabindex on day cells.

### S3-03 Calendar data

- Authenticated `GET /api/calendar?from=&to=` returns only the current user’s sessions and workouts in that range.
- Range is required, inclusive, max 45 days (enough for a month grid, not all-time).
- Invalid or unexpected query fields return 400 without internal details.
- Dates are stored as UTC midnight of the civil `YYYY-MM-DD` value and displayed on that same calendar day.

### S3-04 Calendar actions

- From a selected day, the user can open details, edit, delete, schedule a session, or log a workout.
- New forms prefill the selected date.
- After save, navigation returns to that calendar date when `returnTo` is present.
- Existing workout history list and pagination remain.

### S3-05 Basic progress

- Authenticated progress page/API uses only the current user’s saved workouts.
- User can select a logged exercise and a date range (max 366 days).
- Table and simple bar view show workout date and highest recorded **kg** for that exercise in each workout.
- Workout count for the range is shown.
- Empty states exist when there are no workouts, no selected exercise, or no matching sets.
- Units are kilograms only (the app does not store pounds). Values are **not** labeled as personal records or strength estimates.

### S3-06 Validation and security

- Calendar, session, and progress routes require the existing session.
- Owner is taken from the authenticated user, never from a client-supplied user id.
- CSRF, unexpected-field rejection, and input validation are preserved.

### S3-07 Tests

- Isolated in-memory MongoDB; development/production data is not reset.
- Coverage listed in [test-report.md](./test-report.md).
- Live Google OAuth remains a manual/credential-gated check.

## Implementation tasks

| Task ID | PBI | Task | Estimate (h) | Owner | Status |
| --- | --- | --- | ---: | --- | --- |
| S3-01-T1 | S3-01 | Session serialize/deserialize uses Mongo `_id` only | 2 | Unassigned | Done in repo |
| S3-01-T2 | S3-01 | Google + local workout owner regression tests | 4 | Unassigned | Done in repo |
| S3-02-T1 | S3-02 | Month grid, legend, day panel, keyboard nav | 8 | Unassigned | Done in repo |
| S3-03-T1 | S3-03 | `GymSession` model and session CRUD APIs | 3 | Unassigned | Done in repo (supporting) |
| S3-03-T2 | S3-03 | Range-scoped calendar API | 2 | Unassigned | Done in repo |
| S3-04-T1 | S3-04 | Prefill dates, returnTo, reuse forms | 5 | Unassigned | Done in repo |
| S3-05-T1 | S3-05 | Progress API + page (kg, count, empty states) | 6 | Unassigned | Done in repo |
| S3-06-T1 | S3-06 | Authn, owner scoping, date/exercise validation | 4 | Unassigned | Done in repo |
| S3-07-T1 | S3-07 | Server API tests | 5 | Unassigned | Done in repo |
| S3-07-T2 | S3-07 | Frontend calendar/progress tests + regression | 3 | Unassigned | Done in repo |
| S3-08-T1 | S3-08 | Plan, Gantt, burndown, EVM, Scrum, risks | 4 | Unassigned | Done in repo |
| S3-09-T1 | S3-09 | Record real test/lint/build results | 2 | Unassigned | See test report |
| S3-10-T1 | S3-10 | Review checklist and feedback fields | 1 | Unassigned | Template only |
| S3-11-T1 | S3-11 | Retro template | 1 | Unassigned | Template + observed notes |

## Updated product backlog

### Completed in Sprint 1 (verified in repo)

| ID | Item | Notes |
| --- | --- | --- |
| S1-01 | Repository / MERN setup | Complete per README |
| S1-02 | Registration interface | Complete |
| S1-03 / S1-04 | Local account registration | Complete |
| S1-05 / S1-06 | Login, session, Google OAuth | Complete (live Google still needs credentials) |
| S1-07 / S1-08 | Profile read/update and validation | Complete |
| S1-09 | Frontend auth/profile flow tests | Complete |

### Completed in Sprint 2 (verified in repo)

S2-01 through S2-08 workout model, CRUD, history, details, authz, and isolated tests. S2-09/S2-10 course files exist. S2-11/S2-12 remain process leftovers (no recorded review or retrospective meeting).

### Proposed and selected for Sprint 3

S3-01 through S3-11 in the table above.

### Remaining (not selected for Sprint 3)

| ID | Item | Priority | Notes |
| --- | --- | --- | --- |
| F-01 | Diet / meal planning | Later | Explicitly out of Sprint 3 |
| F-02 | Social features (follow, feed, comments) | Later | Out of Sprint 3 |
| F-03 | Advanced analytics and progress charts | Later | Basic progress is S3-05; F-03 remains later |
| F-04 | Workout templates / suggested routines | Later | Not in proposed scope |
| F-05 | Mobile native apps | Later | Web MERN only |
| S2-11 leftover | Stakeholder review meeting (Sprint 2) | Course | Cannot close from code alone |
| S3-10 leftover | Stakeholder review meeting (Sprint 3) | Course | Cannot close from code alone |
| S3-11 leftover | Facilitated team retrospective | Course | Cannot close from code alone |

## Known blockers (independent work continued)

- No recorded teammate assignments, timesheets, Daily Scrum notes, or stakeholder comments existed in the repo. Independent implementation used the proposed scope and left those fields blank or templated.
- Google OAuth still needs real Google Cloud credentials for a live Google demo. Automated tests mock the provider. Local username/password accounts do not require Google.
- MongoDB must be running (or `MONGO_MEMORY=true`) for a manual demo. Automated tests use an isolated in-memory database.
