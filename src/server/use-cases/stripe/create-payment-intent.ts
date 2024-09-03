import { ProductWithQuantity } from 'src/app/shared/shopping-cart.service';
import { stripe } from './stripe';

interface PaymentIntentParams {
  amountInCents: number;
  products: ProductWithQuantity[];
}

export const createPaymentIntent = async ({
  amountInCents,
  products,
}: PaymentIntentParams) => {
  const serializedProducts = JSON.stringify(
    products.map(({ id, quantity }) => ({ id, quantity })),
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    metadata: {
      products: serializedProducts,
    },
  });
  
  return paymentIntent;
};
