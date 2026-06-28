import { api } from '../lib/apiClient';
import type { Banner, CreateBannerPayload, GetBannersParams, UpdateBannerPayload } from '../types/banner';

const BASE_URL = '/api/banners';

export async function getAllBanners(params?: GetBannersParams): Promise<Banner[]> {
  return api.getData<Banner[]>(BASE_URL, {
    params: params?.type ? { type: params.type } : undefined,
  });
}

export async function createBanner(payload: CreateBannerPayload): Promise<Banner> {
  return api.postData<Banner>(BASE_URL, payload);
}

export async function updateBanner(id: string, payload: UpdateBannerPayload): Promise<Banner> {
  return api.putData<Banner>(`${BASE_URL}/${id}`, payload);
}

export async function deleteBanner(id: string): Promise<Banner> {
  return api.deleteData<Banner>(`${BASE_URL}/${id}`);
}
