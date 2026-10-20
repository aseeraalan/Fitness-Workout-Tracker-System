# Sprint 2 retrospective

Split into **observed implementation notes** (from the codebase work) and **team reflections** that still need humans in the room. Do not treat the second section as a completed retro.

## Observed implementation notes

### What went well (from the code)

- Sprint 1 session auth, CSRF, and profile APIs could be reused for owner-scoped workouts.
- Shared validation in `shared/workoutRules.js` keeps frontend and backend limits aligned.
- Isolated `mongodb-memory-server` tests avoid touching development data.

### What needs improvement (from the code)

- Workout history pagination is offset-based; very large histories may want cursor pagination later.
- The create/edit form is one page component; splitting presentational pieces would help if templates are added later.
- EVM actual hours cannot be computed until the team records time.

### Suggested next-sprint actions (engineering)

1. Add workout templates or reuse-last-workout if the product backlog selects it.
2. Record Daily Scrum remaining-hours so the burndown actual series can be drawn.
3. Keep diet, social, and analytics out of scope until they are selected PBIs.

## Team reflection (fill in the meeting)

### What went well

-

### What needs improvement

-

### Specific next-sprint actions

| Action | Owner | Target date |
| --- | --- | --- |
| | Unassigned | |

**Attendees:**  
**Date:**  
