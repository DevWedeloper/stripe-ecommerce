import { deleteReview as deleteReviewFromDb } from 'src/db/data-access/review/delete-review';

export const deleteReview = async (userId: string, orderItemId: number) =>
  deleteReviewFromDb(userId, orderItemId);
