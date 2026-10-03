import type { InnovationArea, InnovationSummary } from '../../api/types';
import {
  AREA_OPTIONS,
  type LibraryQuery,
  type LibrarySort,
  type Option,
} from './libraryQuery';
import { plural } from './plural';

/** Lower case without diacritics. "ł" has no decomposed form, so it is mapped by hand. */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/ł/g, 'l');
}

function matches(item: InnovationSummary, query: LibraryQuery): boolean {
  const haystack: string = normalise(`${item.name} ${item.summary}`);
  const words: readonly string[] = normalise(query.text)
    .split(/\s+/)
    .filter((word: string): boolean => word !== '');
  return (
    words.every((word: string): boolean => haystack.includes(word)) &&
    (query.areas.length === 0 || query.areas.includes(item.area)) &&
    (query.kinds.length === 0 || query.kinds.includes(item.kind)) &&
    (query.costs.length === 0 || query.costs.includes(item.costBand)) &&
    (!query.seeksTesters || item.seeksTesters) &&
    (!query.hasVideo || item.hasVideo)
  );
}

export function filterInnovations(
  items: readonly InnovationSummary[],
  query: LibraryQuery,
): readonly InnovationSummary[] {
  return items.filter((item: InnovationSummary): boolean =>
    matches(item, query),
  );
}

const collator: Intl.Collator = new Intl.Collator('pl');

/** `MM.YYYY` as a month count, so dates compare as numbers. */
function verifiedMonths(verified: string): number {
  return Number(verified.slice(3)) * 12 + Number(verified.slice(0, 2));
}

function ratingValue(rating: string): number {
  return Number(rating.replace(',', '.'));
}

function byName(a: InnovationSummary, b: InnovationSummary): number {
  return collator.compare(a.name, b.name);
}

const COMPARATORS: Readonly<
  Record<LibrarySort, (a: InnovationSummary, b: InnovationSummary) => number>
> = {
  verified: (a: InnovationSummary, b: InnovationSummary): number =>
    verifiedMonths(b.verified) - verifiedMonths(a.verified),
  rating: (a: InnovationSummary, b: InnovationSummary): number =>
    ratingValue(b.rating) - ratingValue(a.rating) ||
    b.reviewCount - a.reviewCount,
  name: byName,
};

export function sortInnovations(
  items: readonly InnovationSummary[],
  sort: LibrarySort,
): readonly InnovationSummary[] {
  const compare: (a: InnovationSummary, b: InnovationSummary) => number =
    COMPARATORS[sort];
  return [...items].sort(
    (a: InnovationSummary, b: InnovationSummary): number =>
      compare(a, b) || byName(a, b),
  );
}

/** How many items each area would show under every filter except the area one. */
export function countByArea(
  items: readonly InnovationSummary[],
  query: LibraryQuery,
): Readonly<Record<InnovationArea, number>> {
  const pool: readonly InnovationSummary[] = filterInnovations(items, {
    ...query,
    areas: [],
  });
  const counts: Record<InnovationArea, number> = {
    Seniorzy: 0,
    Niepełnosprawność: 0,
    'Rodzina i opiekunowie': 0,
    'Zdrowie psychiczne': 0,
    'Społeczność lokalna': 0,
  };
  for (const option of AREA_OPTIONS) {
    const current: Option<InnovationArea> = option;
    counts[current.value] = pool.filter(
      (item: InnovationSummary): boolean => item.area === current.value,
    ).length;
  }
  return counts;
}

export function resultLabel(shown: number, total: number): string {
  const noun: string = plural(shown, ['innowacja', 'innowacje', 'innowacji']);
  const base: string = `${String(shown)} ${noun}`;
  return shown === total ? base : `${base} z ${String(total)}`;
}
