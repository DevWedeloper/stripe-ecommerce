import { cartItemSchema } from 'src/schemas/order';
import { positiveIntSchema } from 'src/schemas/shared/numbers';
import { createPaymentIntent } from 'src/server/use-cases/stripe/create-payment-intent';
import { updatePaymentIntentMetadata } from 'src/server/use-cases/stripe/update-payment-intent-metadata';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const stripeRouter = router({
  createPaymentIntent: publicProcedure
    .input(
      z.object({
        totalAmountInCents: positiveIntSchema,
        userId: z.string().or(z.null()),
        orderDate: z.coerce.date(),
        cart: z.array(cartItemSchema),
      }),
    )
    .mutation(
      async ({ input: { totalAmountInCents, userId, orderDate, cart } }) =>
        await createPaymentIntent({
          totalAmountInCents,
          userId,
          orderDate,
          cart,
        }),
    ),

  updatePaymentIntentMetadata: publicProcedure
    .input(
      z.object({
        id: z.string(),
        metadata: z.record(z.union([z.string(), z.number(), z.null()])),
      }),
    )
    .mutation(
      async ({ input: { id, metadata } }) =>
        await updatePaymentIntentMetadata(id, metadata),
    ),
});
