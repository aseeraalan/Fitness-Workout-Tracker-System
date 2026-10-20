# Sprint 2 Review and stakeholder feedback

No Sprint Review meeting is recorded in this repository. The sections below are a **demo checklist** and empty fields for real feedback. Do not treat this file as evidence that a review occurred.

## Demonstrable functionality (when the app is running)

1. Register or log in with a local account (Sprint 1 preserved).
2. Optional: Continue with Google if OAuth env vars are configured (Sprint 1 preserved).
3. Open **Workouts** and see the empty state when no logs exist.
4. **Log a workout** with at least one exercise and set; save; land on the detail view.
5. Return to history; newest workout is first.
6. Filter by from/to dates; clear the filter.
7. Open details and confirm exercises, sets, reps, kg, and notes.
8. Edit the workout; fail a save (for example stop the API) and confirm values remain; then save successfully.
9. Delete with confirmation; history no longer shows that workout.
10. Profile, logout, and login still work.

## Remaining issues / incomplete acceptance

- Stakeholder feedback has not been collected.
- S2-11 and S2-12 cannot be marked done from code alone.
- Live Google sign-in still depends on instructor/team Google Cloud credentials.
- Check [test-report.md](./test-report.md) for any failing automated checks.

## Demo checklist

- [ ] MongoDB reachable or `MONGO_MEMORY=true`
- [ ] `npm run install:all` and `npm run dev`
- [ ] Frontend at http://localhost:5173
- [ ] Create account / sign in
- [ ] Create, list, view, edit, delete a workout
- [ ] Date filter and pagination (seed enough workouts if needed)
- [ ] Attempt to open another account’s workout id (expect not found)
- [ ] Profile still loads and saves

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
