# Sprint 2 test report

Automated tests use an isolated in-memory MongoDB (`mongodb-memory-server`). They do **not** drop or overwrite the development or production database.

Recorded **20 October 2026**. Environment: Node v24.18.0, npm 11.16.0, Windows. Commands invoked from the repository root.

## Automated tests

| Suite | Command | Result | Notes |
| --- | --- | --- | --- |
| Server (Vitest + Supertest) | `npm run test:server` | **Passed** — 26 passed, 1 skipped, 5 files | Workout CRUD, validation, unauthenticated access, cross-user 404s, invalid/missing ids, date filter, pagination, Sprint 1 auth files. The skipped test is the existing live-Google placeholder from Sprint 1. |
| Client (Vitest + Testing Library) | `npm run test:client` | **Passed** — 17 passed, 2 files | Auth registration/login/profile regression plus workout empty state, validation, create, edit, delete, date filter, pagination, XSS text rendering. |
| Combined | `npm test` | **Passed** | Same results as the two suites above. |

## Lint and production build

| Check | Command | Result | Notes |
| --- | --- | --- | --- |
| Lint | `npm run lint` | **Passed** | Server `eslint src tests`; client `eslint src`. |
| Production client build | `npm run build` | **Passed** | Vite production build completed (`dist/` assets emitted). |

## Manual / browser checks

Performed against a **temporary in-memory MongoDB** (`MONGO_MEMORY=true npm run dev`) so development data was not used.

| Check | Performed? | Result |
| --- | --- | --- |
| Register local account, land on profile | Yes | Succeeded (`s2demo` / in-memory only) |
| Empty workout history | Yes | “No workouts yet” |
| Create workout with exercise/sets and see details | Yes | Saved; title, notes, 8 reps, 60 kg shown |
| History lists the saved workout | Yes | “Showing 1 of 1 workout” |
| Date filter excluding the workout date | Yes | “No workouts in this date range”; Clear restored the list |
| Edit workout | Yes | Title updated to “Updated push day” |
| Delete with confirmation | Yes | History returned to “No workouts yet” |
| Profile still loads after workout flows | Yes | Username and email still shown |
| Cross-user access in a real browser (two accounts) | **Not performed** | Covered by automated API tests only |
| Live Google OAuth | **Not performed** | Needs Google Cloud credentials |
| Pagination with >10 real workouts in the browser | **Not performed** | Covered by automated UI and API tests |

## Blockers

- No teammate timesheets, Daily Scrum notes, or stakeholder comments exist in the repository, so AC and the actual burndown series remain blank.
- Live Google sign-in was not exercised.
- Two-account browser check was not repeated manually.
