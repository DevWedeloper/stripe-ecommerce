export const sortByOrder = <T extends { order: number }>(array: T[]): T[] =>
  array.sort((a, b) => a.order - b.order);
