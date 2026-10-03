import { describe, expect, it } from 'vitest';

import { exampleTrends } from '../../api/mock/data/trends';
import { tileLevel, topDistricts, trendDelta } from './trends';

describe('trends helpers', (): void => {
  it('describes a rising trend', (): void => {
    expect(trendDelta([18, 21, 22, 26, 29, 34])).toEqual({
      text: '↑ +89%',
      rising: true,
    });
  });

  it('describes a falling trend', (): void => {
    expect(trendDelta([16, 14, 15, 12, 13, 11])).toEqual({
      text: '↓ -31%',
      rising: false,
    });
  });

  it.each([
    [0, 1],
    [9, 1],
    [10, 2],
    [19, 2],
    [20, 3],
    [29, 3],
    [30, 4],
    [38, 4],
  ])('puts %i in level %i', (value: number, level: number): void => {
    expect(tileLevel(value)).toBe(level);
  });

  it('lists the busiest districts, prefixing counties', (): void => {
    expect(topDistricts(exampleTrends.districts, 4)).toEqual([
      { label: 'Kraków', value: '38' },
      { label: 'pow. tarnowski', value: '27' },
      { label: 'pow. krakowski', value: '24' },
      { label: 'pow. nowosądecki', value: '22' },
    ]);
  });
});
