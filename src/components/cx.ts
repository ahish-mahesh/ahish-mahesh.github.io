/** Joins class names, skipping falsy values (CSS Module lookups may be undefined). */
export function cx(...names: (string | false | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}
