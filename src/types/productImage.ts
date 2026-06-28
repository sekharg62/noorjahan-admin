export type ProductImage = {
  id: string;
  productId: string;
  imgUrl: string;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductImagePayload = {
  productId: string;
  imgUrl: string;
  displayOrder: number;
  isPrimary: boolean;
};
