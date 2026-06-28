export type ProductFormValues = {
  categoryId: string;
  menuSubmenuId: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  offerPrice: string;
  stock: number;
  isActive: boolean;
};

export type ProductImageDraft = {
  id: string;
  file: File;
  previewUrl: string;
  displayOrder: number;
  isPrimary: boolean;
};

export const DEFAULT_STOCK = 100;

export const emptyProductFormValues = (): ProductFormValues => ({
  categoryId: '',
  menuSubmenuId: '',
  name: '',
  slug: '',
  description: '',
  price: '',
  offerPrice: '',
  stock: DEFAULT_STOCK,
  isActive: true,
});

export function reorderImages(images: ProductImageDraft[]): ProductImageDraft[] {
  return images.map((image, index) => ({
    ...image,
    displayOrder: index + 1,
  }));
}

export function createImageDraft(file: File, displayOrder: number, isPrimary: boolean): ProductImageDraft {
  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    displayOrder,
    isPrimary,
  };
}
