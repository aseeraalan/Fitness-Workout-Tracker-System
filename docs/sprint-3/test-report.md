# Sprint 3 test report

Automated tests use an isolated in-memory MongoDB (`mongodb-memory-server`). They do **not** drop or overwrite the development or production database.

Results in this file are filled only after commands are actually run.

## Automated tests

| Suite | Command | Result | Notes |
| --- | --- | --- | --- |
| Server (Vitest + Supertest) | `npm run test:server` | Pending | |
| Client (Vitest + Testing Library) | `npm run test:client` | Pending | |
| Combined | `npm test` | Pending | |

## Lint and production build

| Check | Command | Result | Notes |
| --- | --- | --- | --- |
| Lint | `npm run lint` | Pending | |
| Production client build | `npm run build` | Pending | |

## Distinction of test types

| Kind | What it covers | Status |
| --- | --- | --- |
| Automated API tests | Isolated MongoDB, mocked Google provider, owner scoping, calendar ranges, progress kg | See commands above |
| Automated UI tests | Mocked API client; calendar, progress, auth, and workout flows | See commands above |
| Manual browser checks | Running app against local or in-memory Mongo | Not claimed unless performed |
| Live Google OAuth | Real Google Cloud credentials and a browser | **Not automated**; still required for a live demo |

## Manual / browser checks

| Check | Performed? | Result |
| --- | --- | --- |
| Live Google OAuth + save a workout | **Not performed** | Needs Google Cloud credentials |
| Cross-user access in a real browser | **Not performed** | Covered by automated API tests |

## Blockers

Record exact blockers here if a check cannot run (missing credentials, hung MongoDB, and so on).
