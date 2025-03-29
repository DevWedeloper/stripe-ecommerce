import { updateReview as updateReviewFromDb } from 'src/db/data-access/review/update-review';
import { UpdateReviewSchema } from 'src/schemas/review';

export const updateReview = async (userId: string, data: UpdateReviewSchema) =>
  updateReviewFromDb(userId, data);
