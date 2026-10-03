import { describe, expect, it } from 'vitest';

import { addDays, dayMonth, dayMonthTime, longDate } from './dates';

const date: Date = new Date(2026, 9, 3, 8, 5);

describe('dates', (): void => {
  it('formats day and month', (): void => {
    expect(dayMonth(date)).toBe('03.10');
  });

  it('formats day, month and time', (): void => {
    expect(dayMonthTime(date)).toBe('03.10, 08:05');
  });

  it('formats a long Polish date', (): void => {
    expect(longDate(addDays(date, 18))).toBe('21 października 2026');
  });
});
