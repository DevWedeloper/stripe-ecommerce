import { getPaginatedOrdersByUserId } from 'src/db/data-access/order/get-paginated-orders-by-user-id';
import { OrderStatusEnum } from 'src/db/schema';
import { PaginatedOrdersWithItems } from '../types/paginated';

export const getOrdersByUserId = async (
  userId: string,
  page: number = 1,
  pageSize: number = 10,
  status?: OrderStatusEnum,
): Promise<PaginatedOrdersWithItems> => {
  const offset = (page - 1) * pageSize;

  const { orders, totalOrders } = await getPaginatedOrdersByUserId(
    userId,
    offset,
    pageSize,
    status,
  );

  const totalPages = Math.ceil(totalOrders / pageSize);

  return {
    page,
    pageSize,
    totalPages,
    totalOrders,
    orders,
  };
};
