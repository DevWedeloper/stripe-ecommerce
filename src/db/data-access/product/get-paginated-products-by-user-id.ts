import { and, eq, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { productImages, productItems, products } from 'src/db/schema';
import { formatPaginatedResult, totalCount } from '../utils';

export const getPaginatedProductsByUserId = async (
  userId: string,
  offset: number,
  pageSize: number,
) => {
  const thumbnailQuery = db.$with('thumbnail_query').as(
    db
      .select({
        productId: productImages.productId,
        imagePath: productImages.imagePath,
        placeholder: productImages.placeholder,
      })
      .from(productImages)
      .where(eq(productImages.isThumbnail, true)),
  );

  const productLowestPricesQuery = db.$with('product_lowest_prices_query').as(
    db
      .select({
        productId: productItems.productId,
        lowestPrice: sql<number>`min(${productItems.price})`.as('lowest_price'),
      })
      .from(productItems)
      .groupBy(productItems.productId),
  );

  const query = db
    .with(thumbnailQuery, productLowestPricesQuery)
    .select({
      id: products.id,
      userId: products.userId,
      name: products.name,
      description: products.description,
      imagePath: thumbnailQuery.imagePath,
      placeholder: thumbnailQuery.placeholder,
      lowestPrice: productLowestPricesQuery.lowestPrice,
      totalCount: totalCount.as('full_count'),
    })
    .from(products)
    .leftJoin(
      productLowestPricesQuery,
      eq(products.id, productLowestPricesQuery.productId),
    )
    .leftJoin(thumbnailQuery, eq(products.id, thumbnailQuery.productId))
    .where(and(eq(products.userId, userId), eq(products.isDeleted, false)))
    .offset(offset)
    .limit(pageSize);

  const result = await query;

  const { data, totalCount: totalProducts } = formatPaginatedResult(result);

  return {
    products: data,
    totalProducts,
  };
};
