export function sortHits<T extends Record<string, unknown>>(hits: T[], property: string): T[] {
  return [...hits].sort((a, b) => {
    const valueA = a[property];
    const valueB = b[property];

    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return 1;
    if (valueB == null) return -1;

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return valueA - valueB;
    }

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return valueA.localeCompare(valueB);
    }

    const strA = String(valueA);
    const strB = String(valueB);
    return strA.localeCompare(strB);
  });
}
