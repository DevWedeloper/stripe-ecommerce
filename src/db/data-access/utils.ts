import type { Column } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { ProductsWithThumbnail } from '../types';

export const lower = (col: Column) => sql<string>`lower(${col})`;

export const totalCount = sql<number>`count(*) over() AS full_count`;

export type ProductWithTotalCount = ProductsWithThumbnail & {
  totalCount: number;
};

export const formatPaginatedResult = (
  productArray: ProductWithTotalCount[],
): { products: ProductsWithThumbnail[]; totalProducts: number } => {
  const products = productArray.map(
    ({
      id,
      name,
      description,
      price,
      currency,
      imagePath,
      placeholder,
      stock,
    }) => ({
      id,
      name,
      description,
      price,
      currency,
      imagePath,
      placeholder,
      stock,
    }),
  );
  const totalProducts = productArray[0]?.totalCount || 0;

  return { products, totalProducts };
};
