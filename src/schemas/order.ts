import { z } from 'zod';
import { positiveIntSchema } from './shared/numbers';

export const orderStatusSchema = z.enum([
  'Pending',
  'Processed',
  'Shipped',
  'Delivered',
  'Cancelled',
]);

export const cartItemSchema = z.object({
  sellerUserId: z.string(),
  productItemId: positiveIntSchema,
  sku: z.string(),
  quantity: positiveIntSchema,
  price: positiveIntSchema,
});

export type CartItemSchema = z.infer<typeof cartItemSchema>;

export const createOrderSchema = z.object({
  total: positiveIntSchema,
  userId: z.string().nullable(),
  orderDate: z.date(),
  shippingAddressId: positiveIntSchema,
  receiverId: positiveIntSchema,
  productItems: z.array(cartItemSchema),
});

export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
