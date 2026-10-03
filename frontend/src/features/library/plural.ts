/** Polish plural: 1 innowacja, 2–4 innowacje, 5–21 innowacji, 22 innowacje. */
export function plural(
  count: number,
  forms: readonly [one: string, few: string, many: string],
): string {
  const lastTwo: number = count % 100;
  const last: number = count % 10;
  if (count === 1) {
    return forms[0];
  }
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return forms[1];
  }
  return forms[2];
}
