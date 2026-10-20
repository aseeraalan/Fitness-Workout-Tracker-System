# Sprint 2 plan and product backlog

**Sprint:** 2  
**Planned calendar:** 12 October 2026 – 25 October 2026 (two weeks)  
**Estimate unit:** person-hours (not story points)  
**Owner fields:** Unassigned (no recorded team assignments in this repository)  
**Scope source:** **Proposed.** No agreed Sprint 2 backlog was present in the repository. The items below implement the proposed workout-logging scope from the Sprint 2 brief and the required course documentation. Diet planning, social features, and advanced analytics are **not** in this sprint.

## Sprint goal

Authenticated users can create, view, edit, and delete their own workout logs, with owner-scoped APIs, frontend validation, MongoDB persistence, and automated tests. Course tracking artifacts exist for planning, burndown, EVM, review, and retrospective.

## Selected product backlog items

Statuses below are based on source in this branch and the acceptance criteria. They are **not** a claim that the whole sprint is closed: Daily Scrum records, stakeholder feedback, and a team retrospective still need human input. Automated verification is recorded in [test-report.md](./test-report.md).

| ID | PBI | Priority | Estimate (h) | Owner | Status |
| --- | --- | --- | ---: | --- | --- |
| S2-01 | Workout database model | Must | 4 | Unassigned | Implemented; covered by API tests (see TEST-REPORT) |
| S2-02 | Create workout (form + API) | Must | 8 | Unassigned | Implemented; automated + browser create path passed |
| S2-03 | Workout history (filter + pagination) | Must | 6 | Unassigned | Implemented; filter/list passed. Browser pagination with >10 items not repeated |
| S2-04 | Workout details | Must | 4 | Unassigned | Implemented; automated + browser view passed |
| S2-05 | Edit workout | Must | 6 | Unassigned | Implemented; automated + browser edit passed |
| S2-06 | Delete workout with confirmation | Must | 3 | Unassigned | Implemented; automated + browser delete passed |
| S2-07 | Authn/authz, owner scoping, validation | Must | 6 | Unassigned | Implemented; API tests passed. Two-account browser check not repeated |
| S2-08 | Integration tests (API + main UI flow) | Must | 8 | Unassigned | Automated suites passed 2026-10-20 |
| S2-09 | Sprint plan, Gantt, burndown, EVM artifacts | Must (course) | 4 | Unassigned | Drafted in `docs/sprint-2/` |
| S2-10 | Test report of commands actually run | Must (course) | 2 | Unassigned | Filled in [test-report.md](./test-report.md) |
| S2-11 | Sprint Review + stakeholder feedback capture | Must (course) | 1 | Unassigned | Template only; no review meeting recorded |
| S2-12 | Retrospective template + next actions | Must (course) | 1 | Unassigned | Observed code notes drafted; team reflection pending |

**Total planned work:** 53 person-hours.

## Acceptance criteria

### S2-01 Workout model

- Document stores authenticated owner, workout date, title, optional notes, and exercises.
- Each exercise has a name and one or more sets with repetitions and weight in kilograms.
- Timestamps and an owner + date index exist.
- Required fields and numeric limits are validated.

### S2-02 Create workout

- Signed-in user can add/remove exercises and sets, enter details, and save to MongoDB through the API.
- Frontend and backend validation, loading state, and success/error feedback are present.
- Persistence is the real API, not `localStorage` or a mock store in the running app.

### S2-03 Workout history

- Current user’s workouts appear newest first.
- Empty state, date filtering, and pagination (default page size 10, max 50) are present.

### S2-04 Workout details

- Owner can open a saved workout and see exercises, sets, reps, weights, and notes.
- User text is rendered as text (React default escaping).

### S2-05 Edit workout

- Form is populated from the saved workout.
- Owner can update it; entered values remain if saving fails.

### S2-06 Delete workout

- Owner confirms before delete.
- History updates after a successful delete.

### S2-07 Authentication, authorization, validation

- All workout APIs use existing session authentication.
- Owner is taken from the authenticated session, never from a client-supplied user id.
- Read/update/delete queries are scoped to that owner.
- Another user’s workout id yields `404`, not a leak.
- Unexpected fields, invalid ids, and missing inputs are rejected.

### S2-08 Tests

- Isolated in-memory MongoDB (`mongodb-memory-server`); development/production data is not reset.
- Coverage includes CRUD, invalid input, unauthenticated access, cross-user access, invalid/missing ids, date filter, pagination, main frontend flow, and Sprint 1 auth regression.

## Implementation tasks

| Task ID | PBI | Task | Estimate (h) | Owner | Status |
| --- | --- | --- | ---: | --- | --- |
| S2-01-T1 | S2-01 | Shared workout rules | 1 | Unassigned | Done in repo |
| S2-01-T2 | S2-01 | Mongoose `Workout` model | 2 | Unassigned | Done in repo |
| S2-01-T3 | S2-01 | Backend validators | 1 | Unassigned | Done in repo |
| S2-02-T1 | S2-02 | `POST /api/workouts` | 3 | Unassigned | Done in repo |
| S2-02-T2 | S2-02 | Create form UI | 5 | Unassigned | Done in repo |
| S2-03-T1 | S2-03 | `GET /api/workouts` with filter/paging | 3 | Unassigned | Done in repo |
| S2-03-T2 | S2-03 | History page UI | 3 | Unassigned | Done in repo |
| S2-04-T1 | S2-04 | `GET /api/workouts/:id` + detail page | 4 | Unassigned | Done in repo |
| S2-05-T1 | S2-05 | `PATCH /api/workouts/:id` + edit form | 6 | Unassigned | Done in repo |
| S2-06-T1 | S2-06 | `DELETE /api/workouts/:id` + confirm UI | 3 | Unassigned | Done in repo |
| S2-07-T1 | S2-07 | Owner scoping, CSRF, unexpected-field rejection | 6 | Unassigned | Done in repo |
| S2-08-T1 | S2-08 | Server API tests | 5 | Unassigned | Done in repo |
| S2-08-T2 | S2-08 | Frontend flow tests + auth regression | 3 | Unassigned | Done in repo |
| S2-09-T1 | S2-09 | Plan, Gantt, burndown, EVM files | 4 | Unassigned | Done in repo |
| S2-10-T1 | S2-10 | Record real test/lint/build results | 2 | Unassigned | See test report |
| S2-11-T1 | S2-11 | Review checklist and feedback fields | 1 | Unassigned | Template only |
| S2-12-T1 | S2-12 | Retro template | 1 | Unassigned | Template + observed notes |

## Updated product backlog

### Completed in Sprint 1

| ID | Item | Notes |
| --- | --- | --- |
| S1-01 | Repository / MERN setup | Complete per README |
| S1-02 | Registration interface | Complete |
| S1-03 / S1-04 | Local account registration | Complete |
| S1-05 / S1-06 | Login, session, Google OAuth | Complete |
| S1-07 / S1-08 | Profile read/update and validation | Complete |
| S1-09 | Frontend auth/profile flow tests | Complete |

### Proposed and selected for Sprint 2

S2-01 through S2-12 in the table above.

### Remaining (not selected for Sprint 2)

| ID | Item | Priority | Notes |
| --- | --- | --- | --- |
| F-01 | Diet / meal planning | Later | Explicitly out of Sprint 2 |
| F-02 | Social features (follow, feed, comments) | Later | Out of Sprint 2 |
| F-03 | Advanced analytics and progress charts | Later | Out of Sprint 2 |
| F-04 | Workout templates / suggested routines | Later | Not in proposed scope |
| F-05 | Mobile native apps | Later | Web MERN only |
| S2-11 leftover | Stakeholder review meeting and recorded feedback | Course | Cannot close from code alone |
| S2-12 leftover | Facilitated team retrospective | Course | Cannot close from code alone |

## Known blockers (independent work continued)

- No recorded teammate assignments, timesheets, Daily Scrum notes, or stakeholder comments existed in the repo. Independent implementation used the proposed scope and left those fields blank or templated.
- Google OAuth still needs real Google Cloud credentials for a live Google demo (unchanged from Sprint 1). Local username/password accounts do not require Google.
- MongoDB must be running (or `MONGO_MEMORY=true`) for a manual demo. Automated tests use an isolated in-memory database.
