export const reduceToRecord = <T extends { name: string; value: string }>(
  items: T[],
): Record<string, string[]> =>
  items.reduce<Record<string, string[]>>(
    (acc, { name: key, value }) => ({
      ...acc,
      [key]: acc[key] ? [...acc[key], value] : [value],
    }),
    {},
  );
