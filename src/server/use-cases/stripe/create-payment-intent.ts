import { ProductItems } from 'src/db/schema';
import { stripe } from './stripe';

interface PaymentIntentParams {
  totalAmountInCents: number;
  cart: {
    productId: ProductItems['productId'];
    sku: ProductItems['sku'];
    quantity: number;
  }[];
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
