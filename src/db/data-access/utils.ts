import type { Column } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { ProductWithImageAndPricing } from '../types';

export const lower = (col: Column) => sql<string>`lower(${col})`;

export const totalCount = sql<number>`count(*) over()`;

export type ProductWithTotalCount = ProductWithImageAndPricing & {
  totalCount: number;
};

export const formatPaginatedResult = <T extends { totalCount: number }>(
  dataArray: T[],
): { data: Omit<T, 'totalCount'>[]; totalCount: number } => {
  const data = dataArray.map(({ totalCount, ...rest }) => rest);
  const totalCount = dataArray[0]?.totalCount || 0;

  return { data, totalCount };
};
