import type { Column } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { ProductWithImageAndPricing } from '../types';

export const lower = (col: Column) => sql<string>`lower(${col})`;

export const totalCount = sql<number>`count(*) over() AS full_count`;

export type ProductWithTotalCount = ProductWithImageAndPricing & {
  totalCount: number;
};

export const formatPaginatedResult = (
  productArray: ProductWithTotalCount[],
): { products: ProductWithImageAndPricing[]; totalProducts: number } => {
  const products = productArray.map(
    ({
      id,
      name,
      description,
      lowestPrice,
      currency,
      imagePath,
      placeholder,
    }) => ({
      id,
      name,
      description,
      lowestPrice,
      currency,
      imagePath,
      placeholder,
    }),
  );
  const totalProducts = productArray[0]?.totalCount || 0;

  return { products, totalProducts };
};
