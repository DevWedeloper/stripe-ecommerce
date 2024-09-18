import type { Column } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { Products } from '../schema';

export const lower = (col: Column) => sql<string>`lower(${col})`;

type ProductWithTotalCount = Products & {
  totalCount: number;
};

export const formatPaginatedResult = (
  productArray: ProductWithTotalCount[],
): { products: Products[]; totalProducts: number } => {
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
