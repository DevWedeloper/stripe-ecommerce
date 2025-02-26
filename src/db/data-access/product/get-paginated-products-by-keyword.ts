import { and, desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { db } from 'src/db';
import {
  productImages,
  productItems,
  productTags,
  products,
  tags,
} from 'src/db/schema';
import { ProductWithImageAndPricing } from 'src/db/types';
import { formatPaginatedResult, totalCount } from '../utils';

export const getPaginatedProductsByKeyword = async (
  keyword: string,
  offset: number,
  pageSize: number,
): Promise<{
  products: ProductWithImageAndPricing[];
  totalProducts: number;
}> => {
  const matchQuery = sql`
    setweight(to_tsvector('english', ${products.name}), 'A') ||
    setweight(to_tsvector('english', ${products.description}), 'B') ||
    setweight(to_tsvector('english', ${tags.name}), 'C')
  `;

  const productsQuery = db.$with('products_query').as(
    db
      .selectDistinctOn([products.id], {
        ...getTableColumns(products),
        rank: sql<number>`ts_rank(${matchQuery}, websearch_to_tsquery('english', ${keyword}))`.as(
          'rank',
        ),
        rankCd:
          sql<number>`ts_rank_cd(${matchQuery}, websearch_to_tsquery('english', ${keyword}))`.as(
            'rank_cd',
          ),
        totalCount: totalCount.as('full_count'),
      })
      .from(products)
      .leftJoin(productTags, eq(products.id, productTags.productId))
      .leftJoin(tags, eq(productTags.tagId, tags.id))
      .having(
        and(
          sql`(
            ${matchQuery} @@ websearch_to_tsquery('english', ${keyword})
          )`,
          eq(products.isDeleted, false),
        ),
      )
      .groupBy(products.id, tags.id)
      .orderBy((t) => [products.id, desc(t.rank)])
      .offset(offset)
      .limit(pageSize),
  );

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
    .with(productsQuery, thumbnailQuery, productLowestPricesQuery)
    .select({
      id: productsQuery.id,
      userId: productsQuery.userId,
      name: productsQuery.name,
      description: productsQuery.description,
      imagePath: thumbnailQuery.imagePath,
      placeholder: thumbnailQuery.placeholder,
      lowestPrice: productLowestPricesQuery.lowestPrice,
      totalCount: productsQuery.totalCount,
      rank: productsQuery.rank,
    })
    .from(productsQuery)
    .leftJoin(
      productLowestPricesQuery,
      eq(productsQuery.id, productLowestPricesQuery.productId),
    )
    .leftJoin(thumbnailQuery, eq(productsQuery.id, thumbnailQuery.productId))
    .orderBy((t) => desc(t.rank));

  const result = await query;

  const { data, totalCount: totalProducts } = formatPaginatedResult(result);

  return {
    products: data,
    totalProducts,
  };
};
