import { createInsertSchema } from 'drizzle-zod';
import {
  productItems,
  products,
  variationOptions,
  variations,
} from 'src/db/schema';
import { positiveIntSchema } from 'src/schemas/zod-schemas';
import { createProduct } from 'src/server/use-cases/product/create-product';
import { getProductById } from 'src/server/use-cases/product/get-product-by-id';
import { getProductsByCategoryName } from 'src/server/use-cases/product/get-products-by-category-name';
import { getProductsByUserId } from 'src/server/use-cases/product/get-products-by-user-id';
import { searchProductsByKeyword } from 'src/server/use-cases/product/search-products-by-keyword';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const productsRouter = router({
  create: publicProcedure
    .input(
      z.object({
        productData: createInsertSchema(products).omit({ isDeleted: true }),
        variationsData: z.array(
          createInsertSchema(variations).omit({ productId: true }),
        ),
        variationOptionsData: z.array(
          createInsertSchema(variationOptions)
            .omit({ variationId: true })
            .merge(
              z.object({
                variationName: z.string(),
              }),
            ),
        ),
        productItemsData: z.array(
          createInsertSchema(productItems)
            .omit({ productId: true })
            .merge(
              z.object({
                variations: z.array(
                  z.object({
                    name: z.string(),
                    value: z.string(),
                    order: z.number().nullable(),
                  }),
                ),
              }),
            ),
        ),
        categoryId: z.number(),
        productImagesData: z.array(
          z.object({
            imagePath: z.string(),
            placeholder: z.string(),
            isThumbnail: z.boolean(),
          }),
        ),
        tagIds: z.array(z.number()).optional(),
      }),
    )
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

  getByUserId: publicProcedure
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
});
