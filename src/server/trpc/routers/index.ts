import { router } from '../trpc';
import { addressRouter } from './addresses';
import { authRouter } from './auth';
import { categoriesRouter } from './categories';
import { countriesRouter } from './countries';
import { ordersRouter } from './orders';
import { productsRouter } from './products';
import { reviewsRouter } from './reviews';
import { storageRouter } from './storage';
import { stripeRouter } from './stripe';
import { tagsRouter } from './tags';
import { usersRouter } from './users';

export const appRouter = router({
  countries: countriesRouter,
  addresses: addressRouter,
  orders: ordersRouter,
  products: productsRouter,
  reviews: reviewsRouter,
  categories: categoriesRouter,
  tags: tagsRouter,
  users: usersRouter,
  stripe: stripeRouter,
  auth: authRouter,
  storage: storageRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
