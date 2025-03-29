import {
  createReviewSchema,
  getReviewsSchema,
  updateReviewsSchema,
} from 'src/schemas/review';
import { createReview } from 'src/server/use-cases/review/create-review';
import { deleteReview } from 'src/server/use-cases/review/delete-review';
import { getRatingDetails } from 'src/server/use-cases/review/get-rating-details';
import { getReviewByOrderItemId } from 'src/server/use-cases/review/get-review-by-order-item-id';
import { getReviews } from 'src/server/use-cases/review/get-reviews';
import { updateReview } from 'src/server/use-cases/review/update-review';
import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../trpc';

export const reviewsRouter = router({
  create: protectedProcedure.input(createReviewSchema).mutation(
    async ({
      ctx: {
        user: { id },
      },
      input,
    }) => await createReview(id, input),
  ),

  getByOrderItemId: protectedProcedure
    .input(z.object({ orderItemId: z.number() }))
    .query(
      async ({
        ctx: {
          user: { id },
        },
        input: { orderItemId },
      }) => await getReviewByOrderItemId(id, orderItemId),
    ),

  getPaginated: publicProcedure
    .input(getReviewsSchema)
    .query(async ({ input }) => await getReviews(input)),

  getRatingDetails: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => await getRatingDetails(input.productId)),

  update: protectedProcedure.input(updateReviewsSchema).mutation(
    async ({
      ctx: {
        user: { id },
      },
      input,
    }) => await updateReview(id, input),
  ),

  delete: protectedProcedure
    .input(z.object({ orderItemId: z.number() }))
    .mutation(
      async ({
        ctx: {
          user: { id },
        },
        input: { orderItemId },
      }) => await deleteReview(id, orderItemId),
    ),
});
