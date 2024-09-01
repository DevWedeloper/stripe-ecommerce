import { positiveIntSchema } from 'src/schemas/zod-schemas';
import { createPaymentIntent } from 'src/server/use-cases/create-payment-intent';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

const productWithQuantitySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  currency: z.string().min(1),
  imagePath: z.string().nullable(),
  stock: z.number().int().nonnegative(),
  quantity: z.number().int().nonnegative(),
});

export const stripeRouter = router({
  createPaymentIntent: publicProcedure
    .input(
      z.object({
        amountInCents: positiveIntSchema,
        products: z.array(productWithQuantitySchema),
      }),
    )
    .mutation(
      async ({ input: { amountInCents, products } }) =>
        await createPaymentIntent({ amountInCents, products }),
    ),
});
