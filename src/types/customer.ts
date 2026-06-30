import type { PaginationMeta, PaginatedQuery } from './api';

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalAddresses: number;
  createdAt: string;
};

export type CustomerListResponse = {
  customers: Customer[];
  pagination: PaginationMeta;
};

export type GetCustomersParams = PaginatedQuery;
