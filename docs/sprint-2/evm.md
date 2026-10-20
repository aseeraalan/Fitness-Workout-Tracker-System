# Effort-based PV, EV, and AC

**Cost basis:** budgeted and actual **person-hours**. This is an effort-based substitute because no financial budget or invoices are recorded for the project.  
**Do not mix story points with hours.** All EVM figures on this page use person-hours only.  
**Planned completion dates** are the suggested Gantt dates, not proof of historical work.

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
node docs/sprint-2/charts/calculate-evm.js --as-of 2026-10-20
```

The script prints PV, EV, AC, SPI, and CPI, or states which input is missing.

## Tracking table (editable)

See [charts/evm-items.csv](./charts/evm-items.csv). Summary:

| ID | Budgeted hours | Planned complete (suggested) | Status | Actual hours |
| --- | ---: | --- | --- | --- |
| S2-01 | 4 | 2026-10-14 | see CSV | |
| S2-02 | 8 | 2026-10-17 | see CSV | |
| S2-03 | 6 | 2026-10-18 | see CSV | |
| S2-04 | 4 | 2026-10-18 | see CSV | |
| S2-05 | 6 | 2026-10-17 | see CSV | |
| S2-06 | 3 | 2026-10-18 | see CSV | |
| S2-07 | 6 | 2026-10-19 | see CSV | |
| S2-08 | 8 | 2026-10-23 | see CSV | |
| S2-09 | 4 | 2026-10-13 | see CSV | |
| S2-10 | 2 | 2026-10-23 | see CSV | |
| S2-11 | 1 | 2026-10-24 | open | |
| S2-12 | 1 | 2026-10-25 | open | |
| **Total BAC** | **53** | | | **unknown** |

`actual_hours` is blank for every item: no timesheet exists in this repository.

## Reporting snapshot

Fill after a real reporting date and a test-report update. Until `actual_hours` are recorded, **AC, CPI, and CV stay unknown**.

Calculator output after marking S2-01–S2-10 `done` in the CSV (code + docs that meet the completion rule). **AC is unknown** because `actual_hours` are blank.

```text
node docs/sprint-2/charts/calculate-evm.js --as-of 2026-10-20

Reporting date: 2026-10-20
Cost basis: effort-based person-hours
PV (planned value): 41
EV (earned value): 51
AC (actual cost): unknown (actual_hours missing)
SPI (EV/PV): 1.244
CPI (EV/AC): unknown
SV (EV-PV): 10
CV (EV-AC): unknown
```

SPI > 1 only means earned budgeted hours (including S2-08/S2-10, planned for 23 Oct) exceed the **suggested** Gantt value through 20 Oct. It is not a claim about real calendar effort. S2-11 and S2-12 stay `open`.

| Reporting date | PV (h) | EV (h) | AC (h) | SPI | CPI |
| --- | ---: | ---: | ---: | ---: | ---: |
| 2026-10-20 | 41 | 51 | | 1.244 | |
