import type { PaginationMeta, PaginatedQuery } from './api';
import type { OrderStatus } from '../constants/enum';

export type OrderCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

export type OrderAddress = {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  alternativePh: string | null;
  notes: string | null;
};

export type OrderGuest = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  quantity: number;
  size: string;
  price: string;
};

export type Order = {
  id: string;
  orderNo: string;
  status: OrderStatus;
  paymentMethod: string;
  subtotal: string;
  shipping: string;
  total: string;
  customer: OrderCustomer | null;
  address: OrderAddress | null;
  guest: OrderGuest | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type OrderListResponse = {
  orders: Order[];
  pagination: PaginationMeta;
};

export type GetOrdersParams = PaginatedQuery & {
  status?: OrderStatus;
  orderNo?: string;
};

export type UpdateOrderStatusPayload = {
  status: OrderStatus;
};
