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
    setweight(to_tsvector('english', ${tags.name}), 'C')
  `;

  const sq = db
    .selectDistinctOn([products.id], {
      ...getTableColumns(products),
      rank: sql<number>`ts_rank(${matchQuery}, websearch_to_tsquery('english', ${keyword}))`.as(
        'rank',
      ),
      rankCd:
        sql<number>`ts_rank_cd(${matchQuery}, websearch_to_tsquery('english', ${keyword}))`.as(
          'rank_cd',
        ),
    })
    .from(products)
    .leftJoin(productTags, eq(products.id, productTags.productId))
    .leftJoin(tags, eq(productTags.tagId, tags.id))
    .where(
      sql`(
        ${matchQuery} @@ websearch_to_tsquery('english', ${keyword})
      )`,
    )
    .orderBy((t) => [t.id, desc(t.rank)])
    .as('sq');

  const productsResult = await db
    .select({
      id: sq.id,
      name: sq.name,
      description: sq.description,
      price: sq.price,
      currency: sq.currency,
      imagePath: sq.imagePath,
      placeholder: sq.placeholder,
      stock: sq.stock,
      rank: sq.rank,
      rankCd: sq.rankCd,
      totalCount,
    })
    .from(sq)
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
