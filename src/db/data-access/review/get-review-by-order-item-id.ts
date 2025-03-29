import { and, eq } from 'drizzle-orm';
import { db } from 'src/db';
import { userReviews } from 'src/db/schema';

export const getReviewByOrderItemId = async (
  userId: string,
  orderItemId: number,
) => {
  const [result] = await db
    .select()
    .from(userReviews)
    .where(
      and(
        eq(userReviews.userId, userId),
        eq(userReviews.orderItemId, orderItemId),
      ),
    )
    .limit(1);

  return result || null;
};
