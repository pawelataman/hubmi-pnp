import { describe, expect, it } from 'vitest';

import type { InnovationSummary } from '../../api/types';
import {
  countByArea,
  filterInnovations,
  resultLabel,
  sortInnovations,
} from './filterInnovations';
import { EMPTY_QUERY, type LibraryQuery } from './libraryQuery';

function item(overrides: Partial<InnovationSummary>): InnovationSummary {
  return {
    id: 'x',
    name: 'X',
    area: 'Seniorzy',
    kind: 'usługa',
    summary: '',
    verified: '01.2026',
    cost: '',
    costBand: 'low',
    rating: '4,0',
    reviewCount: 1,
    seeksTesters: false,
    hasVideo: false,
    ...overrides,
  };
}

const telefony: InnovationSummary = item({
  id: 'telefony',
  name: 'Sąsiedzkie Telefony Życzliwości',
  summary: 'Wolontariusze dzwonią do samotnych seniorów.',
  kind: 'usługa',
  costBand: 'mid',
  verified: '05.2026',
  rating: '4,6',
  reviewCount: 12,
  seeksTesters: true,
  hasVideo: true,
});
const lawka: InnovationSummary = item({
  id: 'lawka',
  name: 'Ławka Dialogu',
  summary: 'Rozmowy sąsiadów o sprawach wsi.',
  area: 'Społeczność lokalna',
  kind: 'metoda',
  costBand: 'low',
  verified: '12.2025',
  rating: '4,6',
  reviewCount: 3,
});
const rozmowa: InnovationSummary = item({
  id: 'rozmowa',
  name: 'Pierwsza Rozmowa',
  summary: 'Rozmowa z psychologiem bez kolejki.',
  area: 'Zdrowie psychiczne',
  kind: 'usługa',
  costBand: 'high',
  verified: '03.2026',
  rating: '4,5',
  reviewCount: 10,
  hasVideo: true,
});
const cwiczenia: InnovationSummary = item({
  id: 'cwiczenia',
  name: 'Ćwiczenia na Ławce',
  summary: 'Gimnastyka dla seniorów w parku.',
  area: 'Seniorzy',
  kind: 'metoda',
  costBand: 'low',
  verified: '03.2026',
  rating: '3,9',
  reviewCount: 2,
});

const ALL: readonly InnovationSummary[] = [telefony, lawka, rozmowa, cwiczenia];

function ids(items: readonly InnovationSummary[]): readonly string[] {
  return items.map((entry: InnovationSummary): string => entry.id);
}

function run(patch: Partial<LibraryQuery>): readonly string[] {
  return ids(filterInnovations(ALL, { ...EMPTY_QUERY, ...patch }));
}

describe('filterInnovations', (): void => {
  it('returns everything for the empty query', (): void => {
    expect(run({})).toEqual(['telefony', 'lawka', 'rozmowa', 'cwiczenia']);
  });

  it('searches name and summary without case or Polish diacritics', (): void => {
    expect(run({ text: 'zyczliwosci' })).toEqual(['telefony']);
    expect(run({ text: 'ŻYCZLIWOŚCI' })).toEqual(['telefony']);
    expect(run({ text: 'lawka' })).toEqual(['lawka']);
    expect(run({ text: 'ławce' })).toEqual(['cwiczenia']);
    expect(run({ text: 'psychologiem' })).toEqual(['rozmowa']);
  });

  it('requires every word of the search text', (): void => {
    expect(run({ text: 'rozmow' })).toEqual(['lawka', 'rozmowa']);
    expect(run({ text: '  rozmow   wsi ' })).toEqual(['lawka']);
    expect(run({ text: 'rozmow senior' })).toEqual([]);
  });

  it('combines values of one group with OR', (): void => {
    expect(run({ areas: ['Seniorzy', 'Zdrowie psychiczne'] })).toEqual([
      'telefony',
      'rozmowa',
      'cwiczenia',
    ]);
    expect(run({ costs: ['low', 'high'] })).toEqual([
      'lawka',
      'rozmowa',
      'cwiczenia',
    ]);
  });

  it('combines groups, toggles and search with AND', (): void => {
    expect(run({ areas: ['Seniorzy'], kinds: ['metoda'] })).toEqual([
      'cwiczenia',
    ]);
    expect(run({ kinds: ['usługa'], hasVideo: true })).toEqual([
      'telefony',
      'rozmowa',
    ]);
    expect(run({ seeksTesters: true, hasVideo: true })).toEqual(['telefony']);
    expect(run({ text: 'senior', costs: ['mid'] })).toEqual(['telefony']);
  });

  it('filters each cost band', (): void => {
    expect(run({ costs: ['low'] })).toEqual(['lawka', 'cwiczenia']);
    expect(run({ costs: ['mid'] })).toEqual(['telefony']);
    expect(run({ costs: ['high'] })).toEqual(['rozmowa']);
  });
});

describe('sortInnovations', (): void => {
  it('sorts by verification date across a year boundary, newest first, then by name', (): void => {
    expect(ids(sortInnovations(ALL, 'verified'))).toEqual([
      'telefony',
      'cwiczenia',
      'rozmowa',
      'lawka',
    ]);
  });

  it('sorts by rating, then review count', (): void => {
    expect(ids(sortInnovations(ALL, 'rating'))).toEqual([
      'telefony',
      'lawka',
      'rozmowa',
      'cwiczenia',
    ]);
  });

  it('sorts by name with Polish collation', (): void => {
    expect(ids(sortInnovations(ALL, 'name'))).toEqual([
      'cwiczenia',
      'lawka',
      'rozmowa',
      'telefony',
    ]);
  });

  it('does not change its input', (): void => {
    const input: readonly InnovationSummary[] = [lawka, telefony];
    sortInnovations(input, 'name');
    expect(ids(input)).toEqual(['lawka', 'telefony']);
  });
});

describe('countByArea', (): void => {
  it('counts per area under the other filters, ignoring the area selection', (): void => {
    expect(
      countByArea(ALL, {
        ...EMPTY_QUERY,
        areas: ['Zdrowie psychiczne'],
        kinds: ['metoda'],
      }),
    ).toEqual({
      Seniorzy: 1,
      Niepełnosprawność: 0,
      'Rodzina i opiekunowie': 0,
      'Zdrowie psychiczne': 0,
      'Społeczność lokalna': 1,
    });
  });
});

describe('resultLabel', (): void => {
  it('names the count and adds the total only when filtered', (): void => {
    expect(resultLabel(12, 12)).toBe('12 innowacji');
    expect(resultLabel(5, 12)).toBe('5 innowacji z 12');
    expect(resultLabel(3, 12)).toBe('3 innowacje z 12');
    expect(resultLabel(1, 12)).toBe('1 innowacja z 12');
    expect(resultLabel(0, 12)).toBe('0 innowacji z 12');
  });
});
