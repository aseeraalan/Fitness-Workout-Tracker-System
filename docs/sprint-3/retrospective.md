# Sprint 3 retrospective

Split into **observed implementation notes** (from the codebase work) and **team reflections** that still need humans in the room. Do not treat the second section as a completed retro. **No team retrospective meeting is recorded in this repository.**

## Observed implementation notes

### What went well (from the code)

- Sprint 1 session auth, CSRF, and Sprint 2 workout APIs could be reused for calendar and progress owner scoping.
- Date-only UTC midnight storage avoided converting civil dates through the local time zone.
- Isolated `mongodb-memory-server` tests still avoid touching development data.
- Existing workout forms were reused with `date` and `returnTo` query parameters instead of a second editor.

### What needs improvement (from the code)

- Gym scheduling did not exist before this sprint; the new `GymSession` model is supporting calendar work, not a claim that Sprint 2 shipped scheduling.
- Progress is kg-only highest-set weight. Mixed lb/kg conversion is unused because the app never stored pounds.
- Live Google OAuth still cannot be exercised in automated tests without credentials.
- EVM actual hours cannot be computed until the team records time.

### Suggested next-sprint actions (engineering)

1. Perform a live Google login and save a workout once Cloud credentials are available.
2. Record Daily Scrum remaining-hours so the burndown actual series can be drawn.
3. Keep diet, social, templates, and advanced analytics out of scope until they are selected PBIs.

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
