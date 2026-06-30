import type { PaginationMeta, PaginatedQuery } from './api';
import type { ProductImage } from './productImage';

export type Product = {
  id: string;
  menuSubmenuId: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  offerPrice: string | null;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images?: ProductImage[];
};

export type ProductListResponse = {
  products: Product[];
  pagination: PaginationMeta;
};

export type GetProductsParams = PaginatedQuery & {
  menuId?: string;
  submenuId?: string;
};

export type CreateProductPayload = {
  menuSubmenuId: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  offerPrice?: string | null;
  stock?: number;
  isActive?: boolean;
};

export type PatchProductPayload = {
  menuSubmenuId?: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: string;
  offerPrice?: string | null;
  stock?: number;
  isActive?: boolean;
};
