export function getFindFunction(allValues: string[], strictMode = false) {
  function getClearValue(value: string) {
    if (strictMode) {
      return value.toLocaleLowerCase().trim();
    }

    return value
      .toLocaleLowerCase()
      .replaceAll(/\([^)]*\)/g, '')
      .replace(/[^a-zA-Zа-яА-ЯіїєґІЇЄҐ\s]/g, '')
      .replaceAll(' ', '');
  }

  function cyclicPermutations(arr: string[]) {
    return arr.map((_, index) => arr.slice(index).concat(arr.slice(0, index)));
  }

  function getVariableOfValue(value: string) {
    if (strictMode) return [value];

    const arr = value.split(' ');
    return cyclicPermutations(arr).map((el) => el.join(' '));
  }

  function find(allValues: string[], value: string) {
    const result = allValues.find((element) => value.includes(element) || element.includes(value));
    return Array.isArray(result) ? result.pop() : result;
  }

  const clearedAllValues = allValues.map(getClearValue);

  return (value: string) => {
    for (const variableValue of getVariableOfValue(value)) {
      const clearedValue = getClearValue(variableValue);
      const result = find(clearedAllValues, clearedValue);

      if (result) {
        return allValues[clearedAllValues.indexOf(result)];
      }
    }

    return null;
  };
}
