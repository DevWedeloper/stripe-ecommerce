import { getPaginatedReviews } from 'src/db/data-access/review/get-paginated-reviews';
import { GetReviewsSchema } from 'src/schemas/review';

export const getReviews = async (data: GetReviewsSchema) => {
  const { page, pageSize } = data;
  const offset = (page - 1) * pageSize;

  const { reviews, totalReviews } = await getPaginatedReviews(offset, data);

  const totalPages = Math.ceil(totalReviews / pageSize);

  return {
    page,
    pageSize,
    totalPages,
    totalReviews,
    reviews,
  };
};
