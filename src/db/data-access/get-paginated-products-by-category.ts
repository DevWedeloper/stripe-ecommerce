import { inArray, sql } from 'drizzle-orm';
import { db } from '..';
import { Products, productCategories, products } from '../schema';

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

  const productsArray = productResult.map((result) => result.products);
  const totalProducts = productResult[0]?.totalCount || 0;

  return {
    products: productsArray,
    totalProducts,
  };
};
