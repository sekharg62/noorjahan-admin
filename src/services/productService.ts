import { api } from '../lib/apiClient';
import type { CreateProductPayload, Product } from '../types/product';

const BASE_URL = '/api/products';

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  return api.postData<Product>(BASE_URL, payload);
}
