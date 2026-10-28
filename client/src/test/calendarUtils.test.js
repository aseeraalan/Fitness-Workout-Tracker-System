import { describe, expect, it } from 'vitest';
import { localDateString } from '@shared/workoutRules.js';
import { monthGrid, visibleRange } from '../calendarUtils.js';

describe('calendar month grid date placement', () => {
  it('keeps October 31 and November 1 on their civil dates', () => {
    const october = monthGrid(2026, 9);
    const dates = october.map((cell) => cell.dateString);
    expect(dates).toContain('2026-10-31');
    expect(dates.filter((value) => value === '2026-10-31')).toHaveLength(1);
    expect(visibleRange(october).to).toBe(dates[dates.length - 1]);

    const december = monthGrid(2026, 11);
    expect(december.some((cell) => cell.dateString === '2026-12-01' && cell.inMonth)).toBe(true);
    expect(december.some((cell) => cell.dateString === '2026-11-30' && !cell.inMonth)).toBe(true);
  });

  it('places a local midnight date on that local calendar day, not a shifted UTC day', () => {
    const localMidnight = new Date(2026, 2, 1, 0, 0, 0, 0);
    expect(localDateString(localMidnight)).toBe('2026-03-01');
    const march = monthGrid(2026, 2);
    expect(march.some((cell) => cell.dateString === '2026-03-01' && cell.inMonth)).toBe(true);
    expect(march.some((cell) => cell.dateString === '2026-02-28' && cell.inMonth)).toBe(false);
  });
});
