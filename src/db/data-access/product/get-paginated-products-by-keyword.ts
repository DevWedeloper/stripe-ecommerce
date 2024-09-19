import { desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { union } from 'drizzle-orm/pg-core';
import { db } from 'src/db';
import { Products, productTags, products, tags } from 'src/db/schema';
import { formatPaginatedResult, totalCount } from '../utils';

export const getPaginatedProductsByKeyword = async (
  keyword: string,
  offset: number,
  pageSize: number,
): Promise<{ products: Products[]; totalProducts: number }> => {
  const productMatchQuery = sql`(
    setweight(to_tsvector('english', ${products.name}), 'A') ||
    setweight(to_tsvector('english', ${products.description}), 'B')), websearch_to_tsquery('english', ${keyword})`;

  const tagMatchQuery = sql`to_tsvector('english', ${tags.name}), websearch_to_tsquery('english', ${keyword})`;

  const productQuery = db
    .select({
      ...getTableColumns(products),
      rank: sql<number>`ts_rank(${productMatchQuery})`.as('rank'),
      rankCd: sql<number>`ts_rank_cd(${productMatchQuery})`.as('rankCd'),
    })
    .from(products)
    .where(
      sql`(
        setweight(to_tsvector('english', ${products.name}), 'A') ||
        setweight(to_tsvector('english', ${products.description}), 'B'))
        @@ websearch_to_tsquery('english', ${keyword}
      )`,
    );

  const tagQuery = db
    .select({
      ...getTableColumns(products),
      rank: sql<number>`ts_rank(${tagMatchQuery})`.as('rank'),
      rankCd: sql<number>`ts_rank_cd(${tagMatchQuery})`.as('rankCd'),
    })
    .from(products)
    .innerJoin(productTags, eq(products.id, productTags.productId))
    .innerJoin(tags, eq(productTags.tagId, tags.id))
    .where(
      sql`to_tsvector('english', ${tags.name}) @@ websearch_to_tsquery('english', ${keyword})`,
    );

  const combinedQuery = union(productQuery, tagQuery).as('combined_query');

  const distinctIdQuery = db
    .selectDistinctOn([combinedQuery.id])
    .from(combinedQuery)
    .orderBy((t) => t.id)
    .as('distinct_id_query');

  const result = await db
    .select({
      id: distinctIdQuery.id,
      name: distinctIdQuery.name,
      description: distinctIdQuery.description,
      price: distinctIdQuery.price,
      currency: distinctIdQuery.currency,
      imagePath: distinctIdQuery.imagePath,
      placeholder: distinctIdQuery.placeholder,
      stock: distinctIdQuery.stock,
      rank: distinctIdQuery.rank,
      rankCd: distinctIdQuery.rankCd,
      totalCount,
    })
    .from(distinctIdQuery)
    .orderBy((t) => desc(t.rank))
    .offset(offset)
    .limit(pageSize);

  const { products: productsArray, totalProducts } =
    formatPaginatedResult(result);

  return {
    products: productsArray,
    totalProducts,
  };
};
