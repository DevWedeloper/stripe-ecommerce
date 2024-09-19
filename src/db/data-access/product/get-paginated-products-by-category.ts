import { eq, getTableColumns, inArray } from 'drizzle-orm';
import { db } from '../..';
import { Products, productCategories, products } from '../../schema';
import { formatPaginatedResult, totalCount } from '../utils';

export const getPaginatedProductsByCategory = async (
  categoryIds: number[],
  offset: number,
  pageSize: number,
): Promise<{ products: Products[]; totalProducts: number }> => {
  const productsResult = await db
    .selectDistinct({
      ...getTableColumns(products),
      totalCount,
    })
    .from(products)
    .innerJoin(productCategories, eq(products.id, productCategories.productId))
    .where(inArray(productCategories.categoryId, categoryIds))
    .offset(offset)
    .limit(pageSize);

  const { products: productsArray, totalProducts } =
    formatPaginatedResult(productsResult);

  return {
    products: productsArray,
    totalProducts,
  };
};
