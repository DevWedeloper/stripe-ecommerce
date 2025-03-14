import { paginationSchema } from 'src/schemas/pagination';
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
import { protectedProcedure, publicProcedure, router } from '../trpc';

export const productsRouter = router({
  create: protectedProcedure.input(createProductSchema).mutation(
    async ({
      ctx: {
        user: { id },
      },
      input,
    }) => await createProduct(id, input),
  ),

  getById: publicProcedure
    .input(positiveIntSchema)
    .query(async ({ input }) => await getProductById(input)),

  getByCategoryName: publicProcedure
    .input(
      z.object({
        name: z.string(),
        ...paginationSchema,
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
        ...paginationSchema,
      }),
    )
    .query(
      async ({ input: { keyword, page, pageSize } }) =>
        await searchProductsByKeyword(keyword, page, pageSize),
    ),

  getAllByUserId: protectedProcedure.input(z.object(paginationSchema)).query(
    async ({
      ctx: {
        user: { id },
      },
      input: { page, pageSize },
    }) => await getProductsByUserId(id, page, pageSize),
  ),

  getByUserId: protectedProcedure
    .input(
      z.object({
        productId: positiveIntSchema,
      }),
    )
    .query(
      async ({
        ctx: {
          user: { id },
        },
        input,
      }) => await getUserProductById({ ...input, userId: id }),
    ),

  updateByUserId: protectedProcedure.input(updateProductSchema).mutation(
    async ({
      ctx: {
        user: { id },
      },
      input,
    }) => await updateProductByUserId(id, input),
  ),

  deleteByUserId: protectedProcedure
    .input(
      z.object({
        productId: positiveIntSchema,
      }),
    )
    .mutation(
      async ({
        ctx: {
          event,
          user: { id },
        },
        input,
      }) =>
        await deleteProductByUserId(createClient(event), {
          ...input,
          userId: id,
        }),
    ),
});
