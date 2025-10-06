const toSnakeCase = (key: string): string => {
  if (!key) return key;
  if (key.includes('_')) return key;
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
};

export const mapKeysToSnake = (input: Record<string, unknown>): Record<string, unknown> => {
  return Object.entries(input).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (value === undefined || value === null || value === '') {
      return acc;
    }

    const mappedKey = toSnakeCase(key);
    acc[mappedKey] = value;
    return acc;
  }, {});
};
