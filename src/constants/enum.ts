export const BannerType = {
  HOME: 'HOME',
  CATEGORY: 'CATEGORY',
  PRODUCT: 'PRODUCT',
} as const;

export type BannerType = (typeof BannerType)[keyof typeof BannerType];

export const BANNER_TYPE_OPTIONS: BannerType[] = [
  BannerType.HOME,
  BannerType.CATEGORY,
  BannerType.PRODUCT,
];

export const BANNER_TYPE_LABELS: Record<BannerType, string> = {
  [BannerType.HOME]: 'Home',
  [BannerType.CATEGORY]: 'Category',
  [BannerType.PRODUCT]: 'Product',
};
