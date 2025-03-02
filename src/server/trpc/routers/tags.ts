import { getAllTags } from 'src/db/data-access/tag/get-all-tags';
import { publicProcedure, router } from '../trpc';

export const tagsRouter = router({
  getAll: publicProcedure.query(async () => await getAllTags()),
});
