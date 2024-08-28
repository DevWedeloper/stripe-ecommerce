import { positiveIntSchema } from 'src/schemas/zod-schemas';
import { getProductById } from 'src/server/use-cases/get-product-by-id';
import { getProductsByCategoryName } from 'src/server/use-cases/get-products-by-category-name';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const productsRouter = router({
  getById: publicProcedure
    .input(positiveIntSchema)
    .query(async ({ input }) => await getProductById(input)),
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
