export const sortByOrder = <T extends { order: number | null }>(
  array: T[],
): T[] =>
  array.sort((a, b) => {
    if (a.order === null) return 1;
    if (b.order === null) return -1;
    return a.order - b.order;
  });
