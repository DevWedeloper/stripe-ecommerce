import { and, eq, getTableColumns, inArray } from 'drizzle-orm';
import { ProductsWithThumbnail } from 'src/db/types';
import { db } from '../..';
import { productCategories, productImages, products } from '../../schema';
import { formatPaginatedResult, totalCount } from '../utils';

export const getPaginatedProductsByCategory = async (
  categoryIds: number[],
  offset: number,
  pageSize: number,
): Promise<{ products: ProductsWithThumbnail[]; totalProducts: number }> => {
  const productsResult = await db
    .selectDistinct({
      ...getTableColumns(products),
      imagePath: productImages.imagePath,
      placeholder: productImages.placeholder,
      totalCount,
    })
    .from(products)
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, products.id),
        eq(productImages.isThumbnail, true),
      ),
    )
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
