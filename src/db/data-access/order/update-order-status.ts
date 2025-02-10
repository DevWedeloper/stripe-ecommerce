import { eq } from 'drizzle-orm';
import { db } from 'src/db';
import { orders, OrderSelect, OrderStatusEnum } from 'src/db/schema';

export const updateOrderStatus = async (
  orderId: number,
  status: OrderStatusEnum,
): Promise<OrderSelect> => {
  const [data] = await db
    .update(orders)
    .set({ status })
    .where(eq(orders.id, orderId))
    .returning();

  return data;
};
