import type { CostBand, InnovationArea, InnovationKind } from '../../api/types';

export type LibrarySort = 'verified' | 'rating' | 'name';

export interface LibraryQuery {
  readonly text: string;
  readonly areas: readonly InnovationArea[];
  readonly kinds: readonly InnovationKind[];
  readonly costs: readonly CostBand[];
  readonly seeksTesters: boolean;
  readonly hasVideo: boolean;
  readonly sort: LibrarySort;
}

export interface Option<T> {
  readonly value: T;
  /** The value's form in the URL. */
  readonly slug: string;
  readonly label: string;
}

export const AREA_OPTIONS: readonly Option<InnovationArea>[] = [
  { value: 'Seniorzy', slug: 'seniorzy', label: 'Seniorzy' },
  {
    value: 'Niepełnosprawność',
    slug: 'niepelnosprawnosc',
    label: 'Niepełnosprawność',
  },
  {
    value: 'Rodzina i opiekunowie',
    slug: 'rodzina',
    label: 'Rodzina i opiekunowie',
  },
  {
    value: 'Zdrowie psychiczne',
    slug: 'zdrowie-psychiczne',
    label: 'Zdrowie psychiczne',
  },
  {
    value: 'Społeczność lokalna',
    slug: 'spolecznosc',
    label: 'Społeczność lokalna',
  },
];

export const KIND_OPTIONS: readonly Option<InnovationKind>[] = [
  { value: 'usługa', slug: 'usluga', label: 'Usługa' },
  { value: 'metoda', slug: 'metoda', label: 'Metoda' },
  { value: 'narzędzie', slug: 'narzedzie', label: 'Narzędzie' },
];

export const COST_OPTIONS: readonly Option<CostBand>[] = [
  { value: 'low', slug: 'do-10', label: 'do 10 tys. zł' },
  { value: 'mid', slug: '10-50', label: '10–50 tys. zł' },
  { value: 'high', slug: 'ponad-50', label: 'ponad 50 tys. zł' },
];

export const SORT_OPTIONS: readonly Option<LibrarySort>[] = [
  { value: 'verified', slug: 'zweryfikowane', label: 'Ostatnio zweryfikowane' },
  { value: 'rating', slug: 'oceny', label: 'Najlepiej oceniane' },
  { value: 'name', slug: 'nazwa', label: 'Alfabetycznie' },
];

export const EMPTY_QUERY: LibraryQuery = {
  text: '',
  areas: [],
  kinds: [],
  costs: [],
  seeksTesters: false,
  hasVideo: false,
  sort: 'verified',
};

/** Known slugs only, de-duplicated, in option order. */
function parseList<T>(
  raw: string | null,
  options: readonly Option<T>[],
): readonly T[] {
  if (raw === null) {
    return [];
  }
  const slugs: readonly string[] = raw.split(',');
  return options
    .filter((option: Option<T>): boolean => slugs.includes(option.slug))
    .map((option: Option<T>): T => option.value);
}

function writeList<T>(
  values: readonly T[],
  options: readonly Option<T>[],
): string {
  return options
    .filter((option: Option<T>): boolean => values.includes(option.value))
    .map((option: Option<T>): string => option.slug)
    .join(',');
}

export function parseQuery(params: URLSearchParams): LibraryQuery {
  const sortSlug: string | null = params.get('sort');
  const sort: Option<LibrarySort> | undefined = SORT_OPTIONS.find(
    (option: Option<LibrarySort>): boolean => option.slug === sortSlug,
  );
  return {
    text: params.get('q') ?? '',
    areas: parseList(params.get('obszar'), AREA_OPTIONS),
    kinds: parseList(params.get('typ'), KIND_OPTIONS),
    costs: parseList(params.get('koszt'), COST_OPTIONS),
    seeksTesters: params.get('testerzy') === '1',
    hasVideo: params.get('film') === '1',
    sort: sort?.value ?? EMPTY_QUERY.sort,
  };
}

/** Defaults are left out, so the unfiltered library has no query string. */
export function toSearchParams(query: LibraryQuery): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (query.text !== '') {
    params.set('q', query.text);
  }
  const lists: readonly (readonly [string, string])[] = [
    ['obszar', writeList(query.areas, AREA_OPTIONS)],
    ['typ', writeList(query.kinds, KIND_OPTIONS)],
    ['koszt', writeList(query.costs, COST_OPTIONS)],
  ];
  for (const [name, value] of lists) {
    if (value !== '') {
      params.set(name, value);
    }
  }
  if (query.seeksTesters) {
    params.set('testerzy', '1');
  }
  if (query.hasVideo) {
    params.set('film', '1');
  }
  if (query.sort !== EMPTY_QUERY.sort) {
    params.set('sort', writeList([query.sort], SORT_OPTIONS));
  }
  return params;
}

export function hasFilters(query: LibraryQuery): boolean {
  return (
    query.text.trim() !== '' ||
    query.areas.length > 0 ||
    query.kinds.length > 0 ||
    query.costs.length > 0 ||
    query.seeksTesters ||
    query.hasVideo
  );
}

export function toggleValue<T>(values: readonly T[], value: T): readonly T[] {
  return values.includes(value)
    ? values.filter((item: T): boolean => item !== value)
    : [...values, value];
}
