import { createProductSchema, updateProductSchema } from 'src/schemas/product';
import { positiveIntSchema } from 'src/schemas/shared/numbers';
import { createProduct } from 'src/server/use-cases/product/create-product';
import { deleteProductByUserId } from 'src/server/use-cases/product/delete-product-by-user-id';
import { getProductById } from 'src/server/use-cases/product/get-product-by-id';
import { getProductsByCategoryName } from 'src/server/use-cases/product/get-products-by-category-name';
import { getProductsByUserId } from 'src/server/use-cases/product/get-products-by-user-id';
import { getUserProductById } from 'src/server/use-cases/product/get-user-product-by-id';
import { searchProductsByKeyword } from 'src/server/use-cases/product/search-products-by-keyword';
import { updateProductByUserId } from 'src/server/use-cases/product/update-product-by-user-id';
import { createClient } from 'src/supabase/server';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const productsRouter = router({
  create: publicProcedure
    .input(createProductSchema)
    .mutation(async ({ input }) => await createProduct(input)),

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

  searchByKeyword: publicProcedure
    .input(
      z.object({
        keyword: z.string(),
        page: positiveIntSchema,
        pageSize: positiveIntSchema,
      }),
    )
    .query(
      async ({ input: { keyword, page, pageSize } }) =>
        await searchProductsByKeyword(keyword, page, pageSize),
    ),

  getAllByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        page: positiveIntSchema,
        pageSize: positiveIntSchema,
      }),
    )
    .query(
      async ({ input: { userId, page, pageSize } }) =>
        await getProductsByUserId(userId, page, pageSize),
    ),

  getByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        productId: positiveIntSchema,
      }),
    )
    .query(async ({ input }) => await getUserProductById(input)),

  updateByUserId: publicProcedure
    .input(updateProductSchema)
    .mutation(async ({ input }) => await updateProductByUserId(input)),

  deleteByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        productId: positiveIntSchema,
      }),
    )
    .mutation(
      async ({ input, ctx: { event } }) =>
        await deleteProductByUserId(createClient(event), input),
    ),
});
