# Sprint 3 burndown

**Total planned work:** 50 person-hours, from the PBI estimates in [sprint-plan-and-backlog.md](./sprint-plan-and-backlog.md).  
**Unit:** person-hours remaining.  
**Sprint window:** 26 October 2026 – 8 November 2026 (14 dates from start to end).

This budget is **not** Sprint 2’s 48-hour PV figure and **not** Sprint 2’s 53 planned person-hours.

## Completion rule used to burn down work

An item is burned **in full** (its entire estimate) when it meets its acceptance criteria:

- **Code PBIs (S3-01–S3-07):** implementation is in the repository **and** the automated tests that cover that item pass. No partial-hour credit.
- **S3-08:** the planning/Gantt/burndown/EVM/Scrum/risk files exist in `docs/sprint-3/`.
- **S3-09:** [test-report.md](./test-report.md) records commands that were actually run.
- **S3-10 / S3-11:** burned only when a human records a real Sprint Review / retrospective. Templates alone do **not** burn this work.

Daily **actual remaining** values are left blank unless a reliable record exists. This repository had no Daily Scrum remaining-work series, so the actual series is not invented and is not drawn as a smooth progress line.

## How to update

1. Edit [charts/burndown.csv](./charts/burndown.csv).
2. After each real standup, put the remaining hours (unfinished PBI estimates) in `actual_remaining_hours`.
3. Render:

```bash
node docs/sprint-3/charts/render-burndown.js
```

## Ideal remaining hours

Ideal remaining on date `D` is:

`ideal = 50 * (end - D) / (end - start)`

with `start = 2026-10-26` and `end = 2026-11-08`.

| Date | Ideal remaining (h) | Actual remaining (h) |
| --- | ---: | --- |
| 2026-10-26 | 50.0 | |
| 2026-10-27 | 46.2 | |
| 2026-10-28 | 42.3 | |
| 2026-10-29 | 38.5 | |
| 2026-10-30 | 34.6 | |
| 2026-10-31 | 30.8 | |
| 2026-11-01 | 26.9 | |
| 2026-11-02 | 23.1 | |
| 2026-11-03 | 19.2 | |
| 2026-11-04 | 15.4 | |
| 2026-11-05 | 11.5 | |
| 2026-11-06 | 7.7 | |
| 2026-11-07 | 3.8 | |
| 2026-11-08 | 0.0 | |

## Chart (ideal only)

Actual remaining is omitted because the CSV actual column is blank. The ideal series is the only plotted line.

```mermaid
xychart-beta
    title Sprint 3 burndown (ideal hours remaining)
    x-axis [26, 27, 28, 29, 30, 31, 01, 02, 03, 04, 05, 06, 07, 08]
    y-axis "Hours remaining" 0 --> 55
    line "Ideal remaining" [50.0, 46.2, 42.3, 38.5, 34.6, 30.8, 26.9, 23.1, 19.2, 15.4, 11.5, 7.7, 3.8, 0.0]
```

## Status snapshot (not a daily actual)

This is **not** copied into the actual burndown column. After the implementation in this branch, unfinished course process work is S3-10 and S3-11 (2h) **plus** any code PBI whose tests have not yet passed. Recalculate remaining as `sum of estimates for items that do not yet meet the completion rule`.
