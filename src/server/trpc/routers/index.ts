import { router } from '../trpc';
import { addressRouter } from './addresses';
import { authRouter } from './auth';
import { categoriesRouter } from './categories';
import { countriesRouter } from './countries';
import { productsRouter } from './products';
import { stripeRouter } from './stripe';

export const appRouter = router({
  countries: countriesRouter,
  address: addressRouter,
  products: productsRouter,
  categories: categoriesRouter,
  stripe: stripeRouter,
  auth: authRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
