import { positiveIntSchema } from 'src/schemas/zod-schemas';
import { createPaymentIntent } from 'src/server/use-cases/stripe/create-payment-intent';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

const cartItemSchema = z.object({
  productItemId: z.number(),
  sku: z.string(),
  quantity: z.number(),
  price: z.number(),
});

const cartSchema = z.array(cartItemSchema);

export const stripeRouter = router({
  createPaymentIntent: publicProcedure
    .input(
      z.object({
        totalAmountInCents: positiveIntSchema,
        userId: z.string().or(z.null()),
        orderDate: z.coerce.date(),
        shippingAddressId: positiveIntSchema,
        receiverId: positiveIntSchema,
        cart: cartSchema,
      }),
    )
    .mutation(
      async ({
        input: {
          totalAmountInCents,
          userId,
          orderDate,
          shippingAddressId,
          receiverId,
          cart,
        },
      }) =>
        await createPaymentIntent({
          totalAmountInCents,
          userId,
          orderDate,
          shippingAddressId,
          receiverId,
          cart,
        }),
    ),
});
