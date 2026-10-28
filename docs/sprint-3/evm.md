# Effort-based PV, EV, and AC

**Cost basis:** budgeted and actual **person-hours**. This is an effort-based substitute because no financial budget or invoices are recorded for the project.  
**Do not mix story points with hours.** All EVM figures on this page use person-hours only.  
**Planned completion dates** are the suggested Gantt dates, not proof of historical work.

## Sprint 2 figures are not this sprint’s budget

The Sprint 2 report states a **PV of 48 hours** while its schedule lists **53 planned person-hours**. Those values are Sprint 2 artifacts. They are **not** copied forward as Sprint 3’s BAC, PV, or remaining budget. Sprint 3’s planned effort is **50 person-hours** from [sprint-plan-and-backlog.md](./sprint-plan-and-backlog.md).

## Definitions

| Measure | Meaning | Formula used here |
| --- | --- | --- |
| **PV** (planned value) | Budgeted value of work **planned** to be finished by the reporting date | Sum of `budgeted_hours` for PBIs whose `planned_complete_date` is on or before the reporting date |
| **EV** (earned value) | Budgeted value of work **actually completed** by that date | Sum of `budgeted_hours` for PBIs whose `status` is `done` |
| **AC** (actual cost) | Actual effort of work performed | Sum of `actual_hours` when every `done` item has a recorded actual; otherwise unknown |

Derived (only when the inputs exist):

- `SPI = EV / PV`
- `CPI = EV / AC`
- `CV = EV - AC`
- `SV = EV - PV`

Unknown budgets, actual hours, and reporting values stay **blank**. They are not filled with guesses.

## How to calculate

1. Edit [charts/evm-items.csv](./charts/evm-items.csv).
2. Set `status` to `done` only when the [completion rule](./burndown.md) is met.
3. Record `actual_hours` from timesheets if the team keeps them. Leave blank if unknown.
4. Run:

```bash
node docs/sprint-3/charts/calculate-evm.js --as-of 2026-10-27
```

The script prints PV, EV, AC, SPI, and CPI, or states which input is missing.

## Tracking table (editable)

See [charts/evm-items.csv](./charts/evm-items.csv). Summary:

| ID | Budgeted hours | Planned complete (suggested) | Status | Actual hours |
| --- | ---: | --- | --- | --- |
| S3-01 | 6 | 2026-10-28 | see CSV | |
| S3-02 | 8 | 2026-11-01 | see CSV | |
| S3-03 | 5 | 2026-11-01 | see CSV | |
| S3-04 | 5 | 2026-11-03 | see CSV | |
| S3-05 | 6 | 2026-11-04 | see CSV | |
| S3-06 | 4 | 2026-11-04 | see CSV | |
| S3-07 | 8 | 2026-11-06 | see CSV | |
| S3-08 | 4 | 2026-10-27 | see CSV | |
| S3-09 | 2 | 2026-11-06 | see CSV | |
| S3-10 | 1 | 2026-11-07 | open | |
| S3-11 | 1 | 2026-11-08 | open | |
| **Total BAC** | **50** | | | **unknown** |

`actual_hours` is blank for every item: no timesheet exists in this repository. Until those values exist, **AC, CPI, and CV stay unknown**.

## Reporting snapshot

Fill after a real reporting date and a test-report update. Calculator output will be recorded in [test-report.md](./test-report.md) when commands are run.

| Reporting date | PV (h) | EV (h) | AC (h) | SPI | CPI |
| --- | ---: | ---: | ---: | ---: | ---: |
| | | | | | |
