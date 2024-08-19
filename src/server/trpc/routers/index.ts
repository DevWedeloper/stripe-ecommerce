import { router } from '../trpc';
import { categoriesRouter } from './categories';
import { productsRouter } from './products';

export const appRouter = router({
  products: productsRouter,
  categories: categoriesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
