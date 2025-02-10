import { createSelectSchema } from 'drizzle-zod';
import { orderStatusEnum } from 'src/db/schema';
import { getOrdersByUserId } from 'src/server/use-cases/order/get-orders-by-user-id';
import { updateOrderStatus } from 'src/server/use-cases/order/update-order-status';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const ordersRouter = router({
  getByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        page: z.number(),
        pageSize: z.number(),
        status: z.optional(createSelectSchema(orderStatusEnum)),
      }),
    )
    .query(
      async ({ input: { userId, page, pageSize, status } }) =>
        await getOrdersByUserId(userId, page, pageSize, status),
    ),

  updateStatus: publicProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: createSelectSchema(orderStatusEnum),
      }),
    )
    .mutation(
      async ({ input: { orderId, status } }) =>
        await updateOrderStatus(orderId, status),
    ),
});
