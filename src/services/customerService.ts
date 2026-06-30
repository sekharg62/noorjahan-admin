import { api } from '../lib/apiClient';
import type { CustomerListResponse, GetCustomersParams } from '../types/customer';

const BASE_URL = '/api/admin/customers';

export async function getAllCustomers(params?: GetCustomersParams): Promise<CustomerListResponse> {
  return api.getData<CustomerListResponse>(BASE_URL, {
    params: {
      ...(params?.page !== undefined ? { page: params.page } : {}),
      ...(params?.limit !== undefined ? { limit: params.limit } : {}),
    },
  });
}
