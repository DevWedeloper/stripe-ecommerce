import { db } from 'src/db';
import { userReviews } from 'src/db/schema';
import { CreateReviewSchema } from 'src/schemas/review';

export const createReview = async (
  userId: string,
  data: CreateReviewSchema,
) => {
  const [result] = await db
    .insert(userReviews)
    .values({ ...data, userId })
    .returning();

  return result;
};
