import { and, eq, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { orderItems, productItems, products, userReviews } from 'src/db/schema';

export const getRatingDetails = async (productId: number) => {
  const [result] = await db
    .select({
      count5Star:
        sql`sum(case when ${userReviews.rating} = 5 then 1 else 0 end)`
          .mapWith(Number)
          .as('count_5_star'),
      count4Star:
        sql`sum(case when ${userReviews.rating} = 4 then 1 else 0 end)`
          .mapWith(Number)
          .as('count_4_star'),
      count3Star:
        sql`sum(case when ${userReviews.rating} = 3 then 1 else 0 end)`
          .mapWith(Number)
          .as('count_3_star'),
      count2Star:
        sql`sum(case when ${userReviews.rating} = 2 then 1 else 0 end)`
          .mapWith(Number)
          .as('count_2_star'),
      count1Star:
        sql`sum(case when ${userReviews.rating} = 1 then 1 else 0 end)`
          .mapWith(Number)
          .as('count_1_star'),
    })
    .from(userReviews)
    .innerJoin(orderItems, eq(userReviews.orderItemId, orderItems.id))
    .innerJoin(productItems, eq(orderItems.productItemId, productItems.id))
    .innerJoin(products, eq(productItems.productId, products.id))
    .where(and(eq(products.id, productId), eq(userReviews.isDeleted, false)));

  return result;
};
