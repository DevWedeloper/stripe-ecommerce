import { orderStatusSchema } from 'src/schemas/order';
import { getOrdersByUserId } from 'src/server/use-cases/order/get-orders-by-user-id';
import { updateOrderStatus } from 'src/server/use-cases/order/update-order-status';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const ordersRouter = router({
  getByUserId: protectedProcedure
    .input(
      z.object({
        page: z.number(),
        pageSize: z.number(),
        status: z.optional(orderStatusSchema),
      }),
    )
    .query(
      async ({
        ctx: {
          user: { id },
        },
        input: { page, pageSize, status },
      }) => await getOrdersByUserId(id, page, pageSize, status),
    ),

  updateStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: orderStatusSchema,
      }),
    )
    .mutation(
      async ({ input: { orderId, status } }) =>
        await updateOrderStatus(orderId, status),
    ),
});
