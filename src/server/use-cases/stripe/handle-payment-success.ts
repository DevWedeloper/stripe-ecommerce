import { createOrder } from 'src/db/data-access/order/create-order';
import { getEnvVar } from 'src/env';
import { createOrderSchema } from 'src/schemas/order';
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
    const productItems = JSON.parse(metadata['productItems']);

    const { data, error } = createOrderSchema.safeParse({
      total: convertToDollars(paymentIntent.amount),
      userId,
      orderDate,
      shippingAddressId,
      receiverId,
      productItems,
    });

    if (error) {
      console.error('Validation Error:', error.format());
      throw new Error(error.message);
    }

    await createOrder(data);
  }

  return { received: true };
};
