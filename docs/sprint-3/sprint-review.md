# Sprint 3 Review and stakeholder feedback

No Sprint Review meeting is recorded in this repository. The sections below are a **demo checklist** and empty fields for real feedback. Do not treat this file as evidence that a review occurred.

## Demonstrable functionality (when the app is running)

1. Register or log in with a local account (Sprint 1 preserved).
2. Optional: Continue with Google if OAuth env vars are configured. Live Google workout logging still needs those credentials.
3. Open **Workouts**, log a workout, view history, edit, and delete (Sprint 2 preserved).
4. Open **Calendar**; move months; use Today; see the legend.
5. Schedule a gym session on a selected day; return to that date.
6. Log a workout from a selected day with the date prefilled; return to that date.
7. Open session/workout details from the day panel; use existing edit/delete.
8. Confirm an empty day shows the empty state.
9. Open **Progress**; see workout count; select an exercise; see highest kg per workout in table and bars.
10. Confirm empty progress copy when there are no logs. Values are not called personal records.

## Remaining issues / incomplete acceptance

- Stakeholder feedback has not been collected.
- S3-10 and S3-11 cannot be marked done from code alone.
- Live Google sign-in and live Google workout logging still depend on Google Cloud credentials.
- Check [test-report.md](./test-report.md) for any failing automated checks.

## Demo checklist

- [ ] MongoDB reachable or `MONGO_MEMORY=true`
- [ ] `npm run install:all` and `npm run dev`
- [ ] Frontend at http://localhost:5173
- [ ] Create account / sign in
- [ ] Create, list, view, edit, delete a workout
- [ ] Open calendar, change months, select a day
- [ ] Schedule a session and log a workout from that day
- [ ] Return to the calendar date after save
- [ ] Progress: date range, exercise, kg table
- [ ] Optional: live Google login + log a workout (needs credentials)
- [ ] Attempt to open another account’s workout or session id (expect not found)

## Stakeholder feedback

| Field | Value |
| --- | --- |
| Date of review | |
| Attendees / stakeholders | |
| What was shown | |
| Feedback received | |
| Follow-up actions | |
| Owner of each follow-up | Unassigned unless the team assigns it |

_Leave blank until a real review happens._
