import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { userReviews } from 'src/db/schema';
import { z } from 'zod';
import { paginationSchema } from './pagination';

export const createReviewSchema = createInsertSchema(userReviews).pick({
  orderItemId: true,
  rating: true,
  comment: true,
});

export type CreateReviewSchema = z.infer<typeof createReviewSchema>;

export const reviewSortBySchema = z.enum(['recent', 'highest', 'lowest']);

export type ReviewSortBySchema = z.infer<typeof reviewSortBySchema>;

export const ratingFilterSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export type RatingFilterSchema = z.infer<typeof ratingFilterSchema>;

export const getReviewsSchema = z.object({
  productId: z.number(),
  ...paginationSchema,
  sortBy: reviewSortBySchema.optional().default('recent'),
  ratingFilter: ratingFilterSchema.optional(),
});

export type GetReviewsSchema = z.infer<typeof getReviewsSchema>;

export const updateReviewsSchema = z.object({
  reviewId: z.number(),
  data: createSelectSchema(userReviews, {
    rating: (schema) => schema.int().min(1).max(5),
  }).pick({ rating: true, comment: true }),
});

export type UpdateReviewSchema = z.infer<typeof updateReviewsSchema>;
