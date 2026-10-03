export function cx(
  ...parts: readonly (string | false | null | undefined)[]
): string {
  return parts
    .filter(
      (part: string | false | null | undefined): part is string =>
        typeof part === 'string' && part !== '',
    )
    .join(' ');
}
