import type { BannerType } from '../constants/enum';

export type Banner = {
  id: string;
  imgUrl: string;
  redirectUrl: string;
  order: number;
  type: BannerType;
  createdAt: string;
};

export type CreateBannerPayload = {
  imgUrl: string;
  redirectUrl?: string;
  order: number;
  type?: BannerType;
};

export type UpdateBannerPayload = {
  imgUrl: string;
  redirectUrl?: string;
  order: number;
  type: BannerType;
};

export type GetBannersParams = {
  type?: BannerType;
};
