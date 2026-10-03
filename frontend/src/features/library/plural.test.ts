import { describe, expect, it } from 'vitest';

import { plural } from './plural';

const FORMS: readonly [string, string, string] = [
  'innowacja',
  'innowacje',
  'innowacji',
];

describe('plural', (): void => {
  it.each([
    [0, 'innowacji'],
    [1, 'innowacja'],
    [2, 'innowacje'],
    [4, 'innowacje'],
    [5, 'innowacji'],
    [11, 'innowacji'],
    [12, 'innowacji'],
    [14, 'innowacji'],
    [21, 'innowacji'],
    [22, 'innowacje'],
    [25, 'innowacji'],
    [112, 'innowacji'],
  ])('picks the form for %i', (count: number, expected: string): void => {
    expect(plural(count, FORMS)).toBe(expected);
  });
});
