import {
  AddressAndReceiverData,
  OrderWithItems,
  ProductWithImageAndPricing,
} from 'src/db/types';

export type PaginatedProducts = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalProducts: number;
  products: ProductWithImageAndPricing[];
};

export type PaginatedAddressesAndReceivers = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalAddresses: number;
  addresses: AddressAndReceiverData[];
};

export type PaginatedOrdersWithItems = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalOrders: number;
  orders: OrderWithItems[];
};
