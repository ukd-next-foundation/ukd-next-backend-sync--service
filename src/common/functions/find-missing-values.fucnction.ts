export function findMissingValues(firstArr: string[], secondArr: string[]) {
  const result = firstArr.filter(
    (first) => !secondArr.some((second) => second.toLocaleUpperCase().includes(first.toLocaleUpperCase())),
  );

  return Array.from(new Set(result));
}
