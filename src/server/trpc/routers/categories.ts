import { getAllCategories } from 'src/db/data-access/get-all-categories';
import { publicProcedure, router } from '../trpc';

export const categoriesRouter = router({
  getAll: publicProcedure.query(async () => await getAllCategories()),
});
