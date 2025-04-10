import { defineEventHandler, getRequestHeader, readRawBody } from 'h3';
import { handlePaymentSuccess } from 'src/server/use-cases/stripe/handle-payment-success';

export default defineEventHandler(async (event) => {
  const sig = getRequestHeader(event, 'stripe-signature');
  const body = await readRawBody(event);

  return await handlePaymentSuccess(body!, sig!);
});
