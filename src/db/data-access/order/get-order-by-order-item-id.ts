import { eq, getTableColumns } from 'drizzle-orm';
import { db } from 'src/db';
import { orderItems, orders } from 'src/db/schema';

export const getOrderByOrderItemId = async (orderItemId: number) => {
  const [result] = await db
    .select({
      ...getTableColumns(orders),
    })
    .from(orders)
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(eq(orderItems.id, orderItemId))
    .limit(1);

  return result || null;
};
