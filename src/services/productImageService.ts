import { api } from '../lib/apiClient';
import type { CreateProductImagePayload, ProductImage } from '../types/productImage';

const BASE_URL = '/api/product-images';

export async function createProductImage(
  payload: CreateProductImagePayload,
): Promise<ProductImage> {
  return api.postData<ProductImage>(BASE_URL, payload);
}
