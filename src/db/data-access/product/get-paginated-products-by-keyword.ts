import { desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { Products, productTags, products, tags } from 'src/db/schema';
import { formatPaginatedResult, totalCount } from '../utils';

export const getPaginatedProductsByKeyword = async (
  keyword: string,
  offset: number,
  pageSize: number,
): Promise<{ products: Products[]; totalProducts: number }> => {
  const matchQuery = sql`
    setweight(to_tsvector('english', ${products.name}), 'A') ||
    setweight(to_tsvector('english', ${products.description}), 'B') ||
    setweight(to_tsvector('english', string_agg(${tags.name}, ' ')), 'C')
  `;

  const productsResult = await db
    .select({
      ...getTableColumns(products),
      rank: sql<number>`ts_rank(${matchQuery}, websearch_to_tsquery('english', ${keyword}))`,
      rankCd: sql<number>`ts_rank_cd(${matchQuery}, websearch_to_tsquery('english', ${keyword}))`,
      totalCount,
    })
    .from(products)
    .groupBy(products.id)
    .leftJoin(productTags, eq(products.id, productTags.productId))
    .leftJoin(tags, eq(productTags.tagId, tags.id))
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
