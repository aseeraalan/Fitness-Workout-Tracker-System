import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const csvPath = join(dirname(fileURLToPath(import.meta.url)), 'burndown.csv');
const lines = readFileSync(csvPath, 'utf8').trim().split(/\r?\n/).slice(1);
const rows = lines.map((line) => {
  const [date, ideal, actual] = line.split(',');
  return {
    day: date.slice(-2),
    ideal: ideal === '' ? null : Number(ideal),
    actual: actual === '' || actual === undefined ? null : Number(actual),
  };
});

const days = rows.map((row) => row.day).join(', ');
const ideal = rows.map((row) => row.ideal).join(', ');
const hasActual = rows.some((row) => row.actual !== null && !Number.isNaN(row.actual));
const actualLine = hasActual
  ? `    line "Actual remaining" [${rows.map((row) => (row.actual === null ? 'null' : row.actual)).join(', ')}]`
  : '    %% actual remaining omitted: CSV values are blank';

process.stdout.write(`\`\`\`mermaid
xychart-beta
    title Sprint 3 burndown (hours remaining)
    x-axis [${days}]
    y-axis "Hours remaining" 0 --> 55
    line "Ideal remaining" [${ideal}]
${actualLine}
\`\`\`
`);
