import { router } from '../trpc';
import { categoriesRouter } from './categories';

export const appRouter = router({
  categories: categoriesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
