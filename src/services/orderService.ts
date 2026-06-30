import { api } from '../lib/apiClient';
import type {
  GetOrdersParams,
  Order,
  OrderListResponse,
  UpdateOrderStatusPayload,
} from '../types/order';

const BASE_URL = '/api/admin/orders';

export async function getAllOrders(params?: GetOrdersParams): Promise<OrderListResponse> {
  return api.getData<OrderListResponse>(BASE_URL, {
    params: {
      ...(params?.page !== undefined ? { page: params.page } : {}),
      ...(params?.limit !== undefined ? { limit: params.limit } : {}),
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.orderNo?.trim() ? { orderNo: params.orderNo.trim() } : {}),
    },
  });
}

export async function updateOrderStatus(id: string, payload: UpdateOrderStatusPayload): Promise<Order> {
  return api.patchData<Order>(`${BASE_URL}/${id}`, payload);
}
