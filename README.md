# Fitness and Workout Tracker System

CPS714 Group 22 MERN app: Sprint 1 registration, username/password and Google authentication, session security, and an editable profile, plus **proposed Sprint 2 workout logging** (create, history, details, edit, delete) scoped to the authenticated owner.

S1-01 (repository setup) is complete. This codebase implements **S1-02 through S1-09** and **proposed S2-01 through S2-08**. Course artifacts live in [`docs/sprint-2/`](docs/sprint-2/README.md). Diet planning, social features, and advanced analytics are not in this sprint.

## Stack

- **MongoDB** for user accounts, workout logs, and session storage
- **Express** and **Node.js** for the API
- **React** (Vite) for the frontend
- JavaScript throughout

## Prerequisites

- Node.js 20 or newer (this project was verified with Node 24)
- npm 10 or newer
- MongoDB Community Server running locally, **or** a MongoDB Atlas connection string
- A modern browser
- Optional: Google Cloud OAuth credentials for “Continue with Google”

## Environment setup

1. Clone or open this repository.
2. Copy the example environment file and edit it:

```bash
cp .env.example .env
```

On Windows PowerShell: `Copy-Item .env.example .env`

3. Set at least:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `SESSION_SECRET` | Long random string used to sign session cookies |
| `FRONTEND_ORIGIN` | Exact frontend origin, e.g. `http://localhost:5173` |
| `BACKEND_ORIGIN` | Exact backend origin, e.g. `http://localhost:5000` |
| `PORT` | API port (default `5000`) |

Local username/password registration and login work **without** Google credentials. Leave the Google values empty until you are ready to configure OAuth.

### MongoDB setup

**Local MongoDB**

1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community).
2. Start the service so it listens on `127.0.0.1:27017`.
3. Keep `MONGODB_URI=mongodb://127.0.0.1:27017/fitness_tracker`.

**MongoDB Atlas**

1. Create a cluster and a database user.
2. Allow your IP address.
3. Paste the connection string into `MONGODB_URI`.

**No MongoDB installed yet**

Set `MONGO_MEMORY=true` in `.env`. The API starts an in-memory database for local demos. Data is discarded when the server stops.

The automated tests **do not** use this database. They start an isolated in-memory MongoDB and never drop development or production data.

### Google OAuth configuration

Google sign-in is optional for Sprint 1 demos of local accounts.

1. Open [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create an OAuth 2.0 Client ID of type **Web application**.
3. Add authorized JavaScript origin: `http://localhost:5000` (and `http://localhost:5173` if prompted).
4. Add authorized redirect URI **exactly**:

```text
http://localhost:5000/api/auth/google/callback
```

5. Put the client ID, client secret, and that callback URL into `.env`:

```text
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

6. Restart the API.

If those values are missing, the app still runs. The **Continue with Google** button is disabled and explains that Google sign-in is not configured.

Google users are identified by Google’s provider id (`googleId`). The API **does not** automatically link a Google login to an existing local account just because the emails match. In that case the user is told to sign in with their username and password.

## Username and password policy

- **Username:** 3–30 characters, must start with a letter, and may contain only letters, numbers, and underscores. Usernames are stored in lowercase.
- **Password:** 8–128 characters with at least one letter and one number. Passwords are hashed with bcryptjs and are never stored or returned in plaintext. Confirm-password is validated and then discarded.
- Emails are trimmed and lowercased. Passwords are **not** trimmed or otherwise rewritten.

## Install and run

From the repository root:

```bash
npm install
npm run install:all
```

Create `.env` as described above, then start both apps:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

Run them separately if you prefer:

```bash
npm run dev:server
npm run dev:client
```

The Vite dev server proxies `/api` to the backend. The API also allows CORS from `FRONTEND_ORIGIN` with credentials, so the apps can run on separate origins.

## Tests, lint, and production build

```bash
npm test
npm run lint
npm run build
```

Server tests use `mongodb-memory-server` (isolated database). Google OAuth tests mock provider profiles; they are **not** a live Google sign-in. A skipped placeholder test documents that a real Google login needs credentials and a browser.

The first server test run may download a MongoDB binary for the in-memory server. That is expected.

## Manual demo checklist

### Sprint 1 (still required)

1. Start MongoDB (or confirm Atlas is reachable).
2. Copy `.env.example` to `.env` and set `MONGODB_URI` plus `SESSION_SECRET`.
3. Run `npm run install:all` and `npm run dev`.
4. Open http://localhost:5173/register.
5. Confirm the Google button is disabled if Google env vars are empty.
6. Register with name, email, username, password, and confirm password.
7. Land on the profile page; refresh the browser and confirm you stay signed in.
8. Edit name, username, and optional height (cm) and weight (kg); save.
9. Log out, then log in with email, then again with username.
10. Try an invalid password and confirm the generic error.
11. Optional: add Google credentials, restart, use **Continue with Google**, and confirm a Google-only account cannot be password-linked by email alone.

### Sprint 2 (proposed workout logging)

12. Sign in, open **Workouts** (empty state if you have no logs).
13. Choose **Log workout**, add at least one exercise and set (reps + weight kg), save.
14. Confirm the detail page shows title, date, notes, exercises, sets, reps, and kg.
15. Return to history; the new workout is first. Filter by from/to dates, then clear.
16. Edit the workout, save, and confirm the details updated.
17. Delete with confirmation; history no longer lists that workout.
18. Optional: register a second account and paste the first workout’s URL; expect “not found”, not the other user’s data.

## Workout API

All routes require an authenticated session cookie. `POST`, `PATCH`, and `DELETE` also require the `X-CSRF-Token` header from `GET /api/auth/csrf-token`. The owner is always the signed-in user. Sending `owner` or `userId` in the body is rejected.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/workouts` | List the current user’s workouts, newest first |
| `POST` | `/api/workouts` | Create a workout |
| `GET` | `/api/workouts/:id` | Read one owned workout |
| `PATCH` | `/api/workouts/:id` | Replace fields on an owned workout |
| `DELETE` | `/api/workouts/:id` | Delete an owned workout (`204`) |

Query parameters for `GET /api/workouts`:

| Param | Default | Notes |
| --- | --- | --- |
| `from` | (none) | Inclusive `YYYY-MM-DD` |
| `to` | (none) | Inclusive `YYYY-MM-DD` |
| `page` | `1` | Whole number ≥ 1 |
| `limit` | `10` | Whole number 1–50 |

### Create / update body

```json
{
  "date": "2026-10-18",
  "title": "Lower body strength",
  "notes": "Felt strong.",
  "exercises": [
    {
      "name": "Back squat",
      "sets": [
        { "reps": 5, "weightKg": 80 },
        { "reps": 5, "weightKg": 85 }
      ]
    }
  ]
}
```

`notes` is optional. Weight may be `0` for bodyweight sets. Limits: title 1–80 characters, notes up to 1000, at most 20 exercises, 20 sets each, reps 1–500, weight 0–1000 kg.

### Example responses

`201` / `200` workout payload:

```json
{
  "workout": {
    "id": "652f1c0e8a0b1c2d3e4f5678",
    "date": "2026-10-18",
    "title": "Lower body strength",
    "notes": "Felt strong.",
    "exercises": [
      {
        "name": "Back squat",
        "sets": [{ "reps": 5, "weightKg": 80 }]
      }
    ],
    "createdAt": "2026-10-18T16:01:00.000Z",
    "updatedAt": "2026-10-18T16:01:00.000Z"
  }
}
```

List payload:

```json
{
  "workouts": [],
  "page": 1,
  "limit": 10,
  "total": 0,
  "totalPages": 1
}
```

Error shape matches Sprint 1: `{ "error": { "code", "message", "details?" } }`.

| Situation | Status | `error.code` |
| --- | --- | --- |
| Not signed in | 401 | `UNAUTHENTICATED` |
| Validation / unexpected fields | 400 | `VALIDATION_ERROR` |
| Malformed id | 400 | `INVALID_ID` |
| Missing workout or another user’s id | 404 | `NOT_FOUND` |
| Missing CSRF token | 403 | `CSRF` |

Frontend routes: `/workouts`, `/workouts/new`, `/workouts/:id`, `/workouts/:id/edit`.

## Project layout

- `client/` — React UI (registration, login, profile, workout pages)
- `server/` — Express API, Passport authentication, sessions, validation, workout routes
- `shared/accountRules.js` — username, password, and fitness-field rules used by both sides
- `shared/workoutRules.js` — workout field limits used by both sides
- `docs/sprint-2/` — Sprint 2 plan, Gantt, burndown, EVM, Scrum template, test report, review, retro
- `.env.example` — placeholders only; never commit real secrets

Diet planning, social features, and other later-sprint items remain out of scope until selected in a later backlog.
