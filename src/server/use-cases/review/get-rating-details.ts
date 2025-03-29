import { getRatingDetails as getRatingDetailsFromDb } from 'src/db/data-access/review/get-rating-details';

export const getRatingDetails = async (productId: number) => {
  const ratingDetails = await getRatingDetailsFromDb(productId);

  return [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count:
      ratingDetails[`count${rating}Star` as keyof typeof ratingDetails] || 0,
  }));
};
