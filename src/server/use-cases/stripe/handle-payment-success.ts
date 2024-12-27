import { createOrder } from 'src/db/data-access/order/create-order';
import { CartItemReference } from 'src/db/types';
import { getEnvVar } from 'src/env';
import { stripe } from './stripe';

const webhookSecret = getEnvVar('STRIPE_WEBHOOK_SECRET');

const convertToDollars = (cents: number) => cents / 100;

export const handlePaymentSuccess = async (body: string, signature: string) => {
  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { metadata } = paymentIntent;
    const userId = metadata['userId'];
    const orderDate = new Date(metadata['orderDate']);
    const shippingAddressId = Number(metadata['shippingAddressId']);
    const receiverId = Number(metadata['receiverId']);
    const productItems = JSON.parse(
      metadata['productItems'],
    ) as CartItemReference[];

    await createOrder({
      total: convertToDollars(paymentIntent.amount),
      userId,
      orderDate,
      shippingAddressId,
      receiverId,
      productItems,
    });
  }

  return { received: true };
};
