import { getEnvVar } from 'src/env';
import Stripe from 'stripe';

const stripeSecretKey = getEnvVar('STRIPE_SECRET_KEY');

export const stripe = new Stripe(stripeSecretKey);
