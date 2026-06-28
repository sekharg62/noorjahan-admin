import { api } from '../lib/apiClient';
import type {
  CreateProductPayload,
  GetProductsParams,
  Product,
  ProductListResponse,
} from '../types/product';

const BASE_URL = '/api/products';

export async function getAllProducts(params?: GetProductsParams): Promise<ProductListResponse> {
  return api.getData<ProductListResponse>(BASE_URL, {
    params: {
      ...(params?.page !== undefined ? { page: params.page } : {}),
      ...(params?.limit !== undefined ? { limit: params.limit } : {}),
      ...(params?.menuId ? { menuId: params.menuId } : {}),
      ...(params?.submenuId ? { submenuId: params.submenuId } : {}),
    },
  });
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  return api.postData<Product>(BASE_URL, payload);
}
