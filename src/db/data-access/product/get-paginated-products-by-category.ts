import { inArray, sql } from 'drizzle-orm';
import { db } from '../..';
import { Products, productCategories, products } from '../../schema';
import { formatPaginatedResult } from '../utils';

export const getPaginatedProductsByCategory = async (
  categoryIds: number[],
  offset: number,
  pageSize: number,
): Promise<{ products: Products[]; totalProducts: number }> => {
  const productResult = await db
    .selectDistinct({
      products,
      totalCount: sql<number>`count(*) over() AS full_count`,
    })
    .from(products)
    .where(
      inArray(
        products.id,
        db
          .select({ productId: productCategories.productId })
          .from(productCategories)
          .where(inArray(productCategories.categoryId, categoryIds)),
      ),
    )
    .offset(offset)
    .limit(pageSize);

  const { products: productsArray, totalProducts } =
    formatPaginatedResult(productResult);

  return {
    products: productsArray,
    totalProducts,
  };
};
