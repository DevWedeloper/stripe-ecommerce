import { updateOrderStatus as updateOrderStatusFromDb } from 'src/db/data-access/order/update-order-status';
import { OrderSelect, OrderStatusEnum } from 'src/db/schema';

export const updateOrderStatus = async (
  orderId: number,
  status: OrderStatusEnum,
): Promise<OrderSelect> => await updateOrderStatusFromDb(orderId, status);
