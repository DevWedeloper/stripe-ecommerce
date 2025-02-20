import { getCategoryTree } from 'src/server/use-cases/category/get-category-tree';
import { publicProcedure, router } from '../trpc';

export const categoriesRouter = router({
  getTree: publicProcedure.query(async () => await getCategoryTree()),
});
