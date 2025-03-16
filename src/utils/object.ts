export const typedObjectFromEntries = <K extends string, V>(
  entries: [K, V][],
): Record<K, V> => {
  return Object.fromEntries(entries) as Record<K, V>;
};

export const typedObjectEntries = <T extends Record<string, any>>(obj: T) =>
  Object.entries(obj) as [keyof T, T[keyof T]][];

export const typedObjectKeys = <T extends Record<string, any>>(obj: T) =>
  Object.keys(obj) as Array<keyof T>;
