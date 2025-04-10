import { and, eq, gte, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { userReviews } from 'src/db/schema';

export const deleteReview = async (userId: string, orderItemId: number) =>
  db
    .update(userReviews)
    .set({ isDeleted: true })
    .where(
      and(
        eq(userReviews.userId, userId),
        eq(userReviews.orderItemId, orderItemId),
        gte(userReviews.createdAt, sql`now() - interval '1 day'`),
      ),
    )
    .returning();
