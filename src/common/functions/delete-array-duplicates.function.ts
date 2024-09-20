function isJSON(value: string): boolean {
  try {
    return JSON.parse(value) && !!value;
  } catch {
    return false;
  }
}

export function deleteArrayDuplicates<T>(array: any[]): T[] {
  const rawArray = array.map((item) => (typeof item === 'object' ? JSON.stringify(item) : item));
  const uniqueArray = Array.from(new Set(rawArray));
  return uniqueArray.map((rawItem) => (isJSON(rawItem) ? JSON.parse(rawItem) : rawItem));
}
