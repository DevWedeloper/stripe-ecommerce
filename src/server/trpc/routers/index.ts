import { router } from '../trpc';
import { authRouter } from './auth';
import { categoriesRouter } from './categories';
import { productsRouter } from './products';
import { stripeRouter } from './stripe';

export const appRouter = router({
  products: productsRouter,
  categories: categoriesRouter,
  stripe: stripeRouter,
  auth: authRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
