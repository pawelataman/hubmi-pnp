import type { DistrictTile, LabelledValue } from '../../api/types';

export interface TrendDelta {
  readonly text: string;
  readonly rising: boolean;
}

/** Percentage change from the first to the last month. */
export function trendDelta(values: readonly number[]): TrendDelta {
  const first: number = values[0] ?? 0;
  const last: number = values.at(-1) ?? 0;
  const change: number =
    first === 0 ? 0 : Math.round(((last - first) / first) * 100);
  const rising: boolean = change >= 0;
  return { text: `${rising ? '↑ +' : '↓ '}${String(change)}%`, rising };
}

export function tileLevel(value: number): 1 | 2 | 3 | 4 {
  if (value >= 30) {
    return 4;
  }
  if (value >= 20) {
    return 3;
  }
  return value >= 10 ? 2 : 1;
}

/** Cities are capitalised in the data; counties get the "pow." prefix. */
export function topDistricts(
  districts: readonly DistrictTile[],
  count: number,
): readonly LabelledValue[] {
  return [...districts]
    .sort((a: DistrictTile, b: DistrictTile): number => b.value - a.value)
    .slice(0, count)
    .map((district: DistrictTile): LabelledValue => ({
      label: /^\p{Lu}/u.test(district.name)
        ? district.name
        : `pow. ${district.name}`,
      value: String(district.value),
    }));
}
