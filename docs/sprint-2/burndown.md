# Sprint 2 burndown

**Total planned work:** 53 person-hours, from the PBI estimates in [sprint-plan-and-backlog.md](./sprint-plan-and-backlog.md).  
**Unit:** person-hours remaining.  
**Sprint window:** 12–25 October 2026 (13 intervals from start date to end date).

## Completion rule used to burn down work

An item is burned **in full** (its entire estimate) when it meets its acceptance criteria:

- **Code PBIs (S2-01–S2-08):** implementation is in the repository **and** the automated tests that cover that item pass. No partial-hour credit.
- **S2-09:** the planning/Gantt/burndown/EVM files exist in `docs/sprint-2/`.
- **S2-10:** [test-report.md](./test-report.md) records commands that were actually run.
- **S2-11 / S2-12:** burned only when a human records a real Sprint Review / retrospective. Templates alone do **not** burn this work.

Daily **actual remaining** values are left blank unless a reliable record exists. This repository had no Daily Scrum remaining-work series, so the actual series is not invented and is not drawn as a smooth progress line.

## How to update

1. Edit [charts/burndown.csv](./charts/burndown.csv).
2. After each real standup, put the remaining hours (unfinished PBI estimates) in `actual_remaining_hours`.
3. Render:

```bash
node docs/sprint-2/charts/render-burndown.js
```

## Ideal remaining hours

Ideal remaining on date `D` is:

`ideal = 53 * (end - D) / (end - start)`

with `start = 2026-10-12` and `end = 2026-10-25`.

| Date | Ideal remaining (h) | Actual remaining (h) |
| --- | ---: | --- |
| 2026-10-12 | 53.0 | |
| 2026-10-13 | 48.9 | |
| 2026-10-14 | 44.8 | |
| 2026-10-15 | 40.8 | |
| 2026-10-16 | 36.7 | |
| 2026-10-17 | 32.6 | |
| 2026-10-18 | 28.5 | |
| 2026-10-19 | 24.5 | |
| 2026-10-20 | 20.4 | |
| 2026-10-21 | 16.3 | |
| 2026-10-22 | 12.2 | |
| 2026-10-23 | 8.2 | |
| 2026-10-24 | 4.1 | |
| 2026-10-25 | 0.0 | |

## Chart (ideal only)

Actual remaining is omitted because the CSV actual column is blank. The ideal series is the only plotted line.

```mermaid
xychart-beta
    title Sprint 2 burndown (ideal hours remaining)
    x-axis [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
    y-axis "Hours remaining" 0 --> 55
    line "Ideal remaining" [53.0, 48.9, 44.8, 40.8, 36.7, 32.6, 28.5, 24.5, 20.4, 16.3, 12.2, 8.2, 4.1, 0.0]
```

## Status snapshot (not a daily actual)

This is **not** copied into the actual burndown column. After the implementation in this branch, unfinished course process work is S2-11 and S2-12 (2h) **plus** any code PBI whose tests have not yet passed. Recalculate remaining as `sum of estimates for items that do not yet meet the completion rule`.
