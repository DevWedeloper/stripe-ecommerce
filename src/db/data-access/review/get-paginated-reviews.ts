import { and, asc, desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { db } from 'src/db';
import {
  orderItems,
  productConfiguration,
  productItems,
  products,
  userReviews,
  users,
  variationOptions,
  variations,
} from 'src/db/schema';
import { VariationObject } from 'src/db/types';
import { GetReviewsSchema } from 'src/schemas/review';
import { formatPaginatedResult, totalCount } from '../utils';

export type ReviewData = Awaited<
  ReturnType<typeof getPaginatedReviews>
>['reviews'][0];

export const getPaginatedReviews = async (
  offset: number,
  { productId, pageSize, sortBy, ratingFilter }: GetReviewsSchema,
) => {
  const variationsQuery = db.$with('variations_query').as(
    db
      .select({
        id: productItems.id,
        variations: sql<VariationObject[]>`
          array_agg(
            json_build_object(
              'name', ${variations.name},
              'value', ${variationOptions.value},
              'order', ${variationOptions.order}
            )
          )
        `.as('variations'),
      })
      .from(productItems)
      .leftJoin(
        productConfiguration,
        eq(productItems.id, productConfiguration.productItemId),
      )
      .leftJoin(
        variationOptions,
        eq(productConfiguration.variationOptionId, variationOptions.id),
      )
      .leftJoin(variations, eq(variationOptions.variationId, variations.id))
      .groupBy(productItems.id),
  );

  const ratingWhere = ratingFilter
    ? eq(userReviews.rating, ratingFilter)
    : undefined;

  const getOrderByClause = () => {
    if (ratingFilter !== undefined) {
      return desc(userReviews.createdAt);
    }
    if (sortBy === 'highest') {
      return desc(userReviews.rating);
    }
    if (sortBy === 'lowest') {
      return asc(userReviews.rating);
    }
    return desc(userReviews.createdAt);
  };

  const result = await db
    .with(variationsQuery)
    .select({
      ...getTableColumns(userReviews),
      avatarPath: users.avatarPath,
      variations: variationsQuery.variations,
      totalCount,
    })
    .from(userReviews)
    .innerJoin(orderItems, eq(userReviews.orderItemId, orderItems.id))
    .innerJoin(productItems, eq(orderItems.productItemId, productItems.id))
    .innerJoin(products, eq(productItems.productId, products.id))
    .innerJoin(users, eq(userReviews.userId, users.id))
    .innerJoin(variationsQuery, eq(productItems.id, variationsQuery.id))
    .where(
      and(
        eq(products.id, productId),
        eq(userReviews.isDeleted, false),
        ratingWhere,
      ),
    )
    .orderBy(getOrderByClause())
    .offset(offset)
    .limit(pageSize);

  const { data, totalCount: totalReviews } = formatPaginatedResult(result);

  return {
    reviews: data,
    totalReviews,
  };
};
