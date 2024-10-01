import { and, desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { productImages, productTags, products, tags } from 'src/db/schema';
import { ProductsWithThumbnail } from 'src/db/types';
import { formatPaginatedResult, totalCount } from '../utils';

export const getPaginatedProductsByKeyword = async (
  keyword: string,
  offset: number,
  pageSize: number,
): Promise<{ products: ProductsWithThumbnail[]; totalProducts: number }> => {
  const matchQuery = sql`
    setweight(to_tsvector('english', ${products.name}), 'A') ||
    setweight(to_tsvector('english', ${products.description}), 'B') ||
    setweight(to_tsvector('english', string_agg(${tags.name}, ' ')), 'C')
  `;

  const productsResult = await db
    .select({
      ...getTableColumns(products),
      imagePath: productImages.imagePath,
      placeholder: productImages.placeholder,
      rank: sql<number>`ts_rank(${matchQuery}, websearch_to_tsquery('english', ${keyword}))`,
      rankCd: sql<number>`ts_rank_cd(${matchQuery}, websearch_to_tsquery('english', ${keyword}))`,
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
    .leftJoin(productTags, eq(products.id, productTags.productId))
    .leftJoin(tags, eq(productTags.tagId, tags.id))
    .groupBy(products.id, productImages.imagePath, productImages.placeholder)
    .having(
      sql`(
        ${matchQuery} @@ websearch_to_tsquery('english', ${keyword})
      )`,
    )
    .orderBy((t) => desc(t.rank))
    .offset(offset)
    .limit(pageSize);

  const { products: productsArray, totalProducts } =
    formatPaginatedResult(productsResult);

  return {
    products: productsArray,
    totalProducts,
  };
};
