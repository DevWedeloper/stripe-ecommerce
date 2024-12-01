import { CartItemReference } from 'src/db/types';
import { stripe } from './stripe';

interface PaymentIntentParams {
  totalAmountInCents: number;
  userId: string | null;
  orderDate: Date;
  shippingAddressId: number;
  cart: CartItemReference[];
}

export const createPaymentIntent = async ({
  totalAmountInCents,
  userId,
  orderDate,
  shippingAddressId,
  cart,
}: PaymentIntentParams) => {
  const productItems = JSON.stringify(
    cart.map(({ productId, sku, quantity, price }) => ({
      productId,
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
      shippingAddressId,
      productItems,
    },
  });

  return paymentIntent;
};
