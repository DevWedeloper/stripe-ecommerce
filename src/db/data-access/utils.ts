import type { Column } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { Products } from '../schema';

export const lower = (col: Column) => sql<string>`lower(${col})`;

type ProductWithTotalCount = {
  product: Products;
  totalCount: number;
};

export const formatPaginatedResult = (
  productArray: ProductWithTotalCount[],
): { products: Products[]; totalProducts: number } => {
  const products = productArray.map((result) => result.product);
  const totalProducts = productArray[0]?.totalCount || 0;

  return { products, totalProducts };
};
