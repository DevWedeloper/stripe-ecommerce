import { CartItemReference } from '../types/cart-item';
import { stripe } from './stripe';

interface PaymentIntentParams {
  totalAmountInCents: number;
  cart: CartItemReference[];
}

export const createPaymentIntent = async ({
  totalAmountInCents,
  cart,
}: PaymentIntentParams) => {
  const serializedProducts = JSON.stringify(
    cart.map(({ productId, sku, quantity }) => ({ productId, sku, quantity })),
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmountInCents,
    currency: 'usd',
    metadata: {
      products: serializedProducts,
    },
  });

  return paymentIntent;
};
