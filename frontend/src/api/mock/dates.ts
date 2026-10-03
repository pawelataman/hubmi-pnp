const MONTHS: readonly string[] = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
];

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function dayMonth(date: Date): string {
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}`;
}

export function dayMonthTime(date: Date): string {
  return `${dayMonth(date)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function longDate(date: Date): string {
  const month: string = MONTHS[date.getMonth()] ?? '';
  return `${String(date.getDate())} ${month} ${String(date.getFullYear())}`;
}

export function addDays(date: Date, days: number): Date {
  const result: Date = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
