import { stripe } from './stripe';

export const updatePaymentIntentMetadata = (
  id: string,
  metadata: { [key: string]: string | number | null },
) => stripe.paymentIntents.update(id, { metadata });
