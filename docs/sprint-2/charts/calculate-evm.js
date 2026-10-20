import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function argValue(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : null;
}

const asOf = argValue('--as-of');
if (!asOf || !/^\d{4}-\d{2}-\d{2}$/.test(asOf)) {
  process.stderr.write('Usage: node calculate-evm.js --as-of YYYY-MM-DD\n');
  process.exit(1);
}

const csvPath = join(dirname(fileURLToPath(import.meta.url)), 'evm-items.csv');
const rows = readFileSync(csvPath, 'utf8')
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((line) => {
    const [id, budgeted, planned, status, actual] = line.split(',');
    return {
      id,
      budgeted: Number(budgeted),
      planned,
      status: (status || '').trim(),
      actual: actual === '' || actual === undefined ? null : Number(actual),
    };
  });

const pv = rows
  .filter((row) => row.planned && row.planned <= asOf)
  .reduce((sum, row) => sum + row.budgeted, 0);

const done = rows.filter((row) => row.status === 'done');
const ev = done.reduce((sum, row) => sum + row.budgeted, 0);

const missingActuals = done.filter((row) => row.actual === null || Number.isNaN(row.actual));
const ac = missingActuals.length > 0 ? null : done.reduce((sum, row) => sum + row.actual, 0);

function ratio(numerator, denominator) {
  if (denominator === null || denominator === 0 || numerator === null) return 'unknown';
  return (numerator / denominator).toFixed(3);
}

process.stdout.write(`Reporting date: ${asOf}
Cost basis: effort-based person-hours
PV (planned value): ${pv}
EV (earned value): ${ev}
AC (actual cost): ${ac === null ? 'unknown (actual_hours missing)' : ac}
SPI (EV/PV): ${ratio(ev, pv)}
CPI (EV/AC): ${ratio(ev, ac)}
SV (EV-PV): ${ev - pv}
CV (EV-AC): ${ac === null ? 'unknown' : ev - ac}
`);
