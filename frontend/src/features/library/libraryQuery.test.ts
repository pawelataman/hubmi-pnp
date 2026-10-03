import { describe, expect, it } from 'vitest';

import {
  EMPTY_QUERY,
  hasFilters,
  parseQuery,
  toggleValue,
  toSearchParams,
  type LibraryQuery,
} from './libraryQuery';

const FULL: LibraryQuery = {
  text: 'telefon senior',
  areas: ['Seniorzy', 'Rodzina i opiekunowie'],
  kinds: ['metoda'],
  costs: ['low', 'high'],
  seeksTesters: true,
  hasVideo: true,
  sort: 'rating',
};

describe('libraryQuery', (): void => {
  it('parses an empty query string to the defaults', (): void => {
    expect(parseQuery(new URLSearchParams(''))).toEqual(EMPTY_QUERY);
  });

  it('writes nothing for the defaults', (): void => {
    expect(toSearchParams(EMPTY_QUERY).toString()).toBe('');
  });

  it('writes every set field under its Polish parameter', (): void => {
    const params: URLSearchParams = toSearchParams(FULL);
    expect([...params.entries()]).toEqual([
      ['q', 'telefon senior'],
      ['obszar', 'seniorzy,rodzina'],
      ['typ', 'metoda'],
      ['koszt', 'do-10,ponad-50'],
      ['testerzy', '1'],
      ['film', '1'],
      ['sort', 'oceny'],
    ]);
  });

  it('round-trips through the query string', (): void => {
    const text: string = toSearchParams(FULL).toString();
    expect(parseQuery(new URLSearchParams(text))).toEqual(FULL);
  });

  it('ignores unknown values and keeps the known ones in option order', (): void => {
    const query: LibraryQuery = parseQuery(
      new URLSearchParams(
        'obszar=spolecznosc,xyz,seniorzy,seniorzy&typ=&koszt=tanio&sort=losowo&testerzy=tak&inne=1',
      ),
    );
    expect(query).toEqual({
      ...EMPTY_QUERY,
      areas: ['Seniorzy', 'Społeczność lokalna'],
    });
  });

  it('counts search text and filters, but not sort, as filters', (): void => {
    expect(hasFilters(EMPTY_QUERY)).toBe(false);
    expect(hasFilters({ ...EMPTY_QUERY, sort: 'name' })).toBe(false);
    expect(hasFilters({ ...EMPTY_QUERY, text: '   ' })).toBe(false);
    expect(hasFilters({ ...EMPTY_QUERY, text: 'a' })).toBe(true);
    expect(hasFilters({ ...EMPTY_QUERY, kinds: ['usługa'] })).toBe(true);
    expect(hasFilters({ ...EMPTY_QUERY, hasVideo: true })).toBe(true);
  });

  it('toggles a value in and out of a list', (): void => {
    expect(toggleValue(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleValue(['a', 'b'], 'a')).toEqual(['b']);
  });
});
