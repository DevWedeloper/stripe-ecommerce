import { CartItemReference } from 'src/db/types';
import { stripe } from './stripe';

interface PaymentIntentParams {
  totalAmountInCents: number;
  userId: string | null;
  orderDate: Date;
  cart: CartItemReference[];
}

export const createPaymentIntent = async ({
  totalAmountInCents,
  userId,
  orderDate,
  cart,
}: PaymentIntentParams) => {
  const productItems = JSON.stringify(
    cart.map(({ productItemId, sku, quantity, price }) => ({
      productItemId,
      sku,
      quantity,
      price,
    })),
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmountInCents,
    currency: 'usd',
    metadata: {
      userId,
      orderDate: orderDate.toISOString(),
      productItems,
    },
  });

  return paymentIntent;
};
