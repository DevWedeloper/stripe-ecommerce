import { getReviewByOrderItemId as getReviewByOrderItemIdFromDb } from 'src/db/data-access/review/get-review-by-order-item-id';

export const getReviewByOrderItemId = async (
  userId: string,
  orderItemId: number,
) => getReviewByOrderItemIdFromDb(userId, orderItemId);
