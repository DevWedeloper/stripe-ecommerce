import Stripe from 'stripe';

const stripeSecretKey = import.meta.env['STRIPE_SECRET_KEY'] as string;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set.');
}

export const stripe = new Stripe(stripeSecretKey);
