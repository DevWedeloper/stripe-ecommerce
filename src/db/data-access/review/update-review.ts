import { and, eq, gte, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { userReviews } from 'src/db/schema';
import { UpdateReviewSchema } from 'src/schemas/review';

export const updateReview = async (
  userId: string,
  { reviewId, data }: UpdateReviewSchema,
) => {
  const [result] = await db
    .update(userReviews)
    .set(data)
    .where(
      and(
        eq(userReviews.id, reviewId),
        eq(userReviews.userId, userId),
        gte(userReviews.createdAt, sql`now() - interval '1 day'`),
      ),
    )
    .returning();

  return result || null;
};
