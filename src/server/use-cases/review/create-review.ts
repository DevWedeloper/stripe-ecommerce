import { getOrderByOrderItemId } from 'src/db/data-access/order/get-order-by-order-item-id';
import { createReview as createReviewFromDb } from 'src/db/data-access/review/create-review';
import { getReviewByOrderItemId } from 'src/db/data-access/review/get-review-by-order-item-id';
import { CreateReviewSchema } from 'src/schemas/review';

export const createReview = async (
  userId: string,
  data: CreateReviewSchema,
) => {
  const existingUserReview = await getReviewByOrderItemId(
    userId,
    data.orderItemId,
  );

  if (existingUserReview && existingUserReview.isDeleted) {
    return {
      data: null,
      error: {
        message:
          'User cant submit a new review after deleting the previous one.',
      },
    };
  }

  if (existingUserReview) {
    return {
      data: null,
      error: { message: 'User already submitted a review for this order.' },
    };
  }

  const order = await getOrderByOrderItemId(data.orderItemId);

  if (!order) {
    return {
      data: null,
      error: { message: `No order found for orderItemId ${data.orderItemId}.` },
    };
  }

  if (!order.deliveredDate) {
    return {
      data: null,
      error: { message: 'The order has not been delivered yet.' },
    };
  }

  const currentDate = new Date();
  const deliveredDate = new Date(order.deliveredDate);

  const differenceInMs = currentDate.getTime() - deliveredDate.getTime();
  const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

  if (differenceInDays > 7) {
    return {
      data: null,
      error: {
        message: 'User can only leave a review within 7 days after purchase.',
      },
    };
  }

  const review = await createReviewFromDb(userId, data);

  return { data: review, error: null };
};
