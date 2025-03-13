import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { productImages } from 'src/db/schema';
import { z } from 'zod';

const productImagesInsertWithoutProductId = createInsertSchema(
  productImages,
).omit({
  productId: true,
});

export const userProductSchema = z.object({
  id: z.number().nullable(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  variants: z.array(
    z.object({
      id: z.number().nullable(),
      variation: z.string().min(1, 'Variation name is required'),
      options: z.array(
        z.object({
          id: z.number().nullable(),
          value: z.string().min(1, 'Option value is required'),
          order: z
            .number()
            .int()
            .min(0, 'Order must be a non-negative integer'),
        }),
      ),
    }),
  ),
  items: z.array(
    z.object({
      id: z.number().nullable(),
      sku: z.string().min(1, 'SKU is required'),
      stock: z.number().int().min(0, 'Stock must be a non-negative integer'),
      price: z.number().min(0, 'Price must be a positive number'),
      variations: z.array(
        z.object({
          name: z.string().min(1, 'Variation name is required'),
          value: z.string().min(1, 'Variation value is required'),
          order: z
            .number()
            .int()
            .min(0, 'Order must be a non-negative integer'),
        }),
      ),
    }),
  ),
  categoryId: z.number().int().min(1, 'Category ID is required'),
  tagIds: z.array(z.number().int().min(1, 'Tag ID must be a positive integer')),
});

export type UserProductFormSchema = z.infer<typeof userProductSchema>;

export const createProductSchema = z.object({
  productDetails: userProductSchema,
  images: z.array(productImagesInsertWithoutProductId),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  modified: userProductSchema,
  modifiedImages: z.object({
    existing: z.array(
      createSelectSchema(productImages).pick({
        id: true,
        isThumbnail: true,
        order: true,
      }),
    ),
    added: z.array(productImagesInsertWithoutProductId),
  }),
});

export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
