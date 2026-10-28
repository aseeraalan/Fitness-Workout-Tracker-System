import { localDateString } from '@shared/workoutRules.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function weekdayLabels() {
  return WEEKDAYS;
}

export function addMonths(year, monthIndex, delta) {
  const date = new Date(year, monthIndex + delta, 1);
  return { year: date.getFullYear(), monthIndex: date.getMonth() };
}

export function monthTitle(year, monthIndex) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(year, monthIndex, 1)
  );
}

export function monthGrid(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = [];

  for (let offset = startPad; offset > 0; offset -= 1) {
    const date = new Date(year, monthIndex, 1 - offset);
    cells.push({
      dateString: localDateString(date),
      day: date.getDate(),
      inMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day);
    cells.push({
      dateString: localDateString(date),
      day,
      inMonth: true,
    });
  }

  while (cells.length % 7 !== 0) {
    const date = new Date(year, monthIndex, daysInMonth + (cells.length - startPad - daysInMonth) + 1);
    cells.push({
      dateString: localDateString(date),
      day: date.getDate(),
      inMonth: false,
    });
  }

  return cells;
}

export function visibleRange(cells) {
  return { from: cells[0].dateString, to: cells[cells.length - 1].dateString };
}

export function groupByDate(items) {
  const map = {};
  for (const item of items || []) {
    if (!map[item.date]) map[item.date] = [];
    map[item.date].push(item);
  }
  return map;
}
