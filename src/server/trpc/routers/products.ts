import { getProductsByCategoryName } from 'src/db/data-access/get-products-by-category-name';
import { positiveIntSchema } from 'src/schemas/zod-schemas';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const productsRouter = router({
  getByCategoryName: publicProcedure
    .input(
      z.object({
        name: z.string(),
        page: positiveIntSchema,
        pageSize: positiveIntSchema,
      }),
    )
    .query(
      async ({ input: { name, page, pageSize } }) =>
        await getProductsByCategoryName(name, page, pageSize),
    ),
});
