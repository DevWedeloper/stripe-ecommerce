import { eq } from 'drizzle-orm';
import { db } from 'src/db';
import { orders, OrderSelect } from 'src/db/schema';

export const updateToDelivered = async (
  orderId: number,
): Promise<OrderSelect> => {
  const [data] = await db
    .update(orders)
    .set({ status: 'Delivered', deliveredDate: new Date() })
    .where(eq(orders.id, orderId))
    .returning();

  return data;
};
