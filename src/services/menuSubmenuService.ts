import { api } from '../lib/apiClient';
import type {
  CreateMenuSubmenuPayload,
  MenuItem,
  MenuItemDetail,
  MenuSubmenuListResponse,
  PatchMenuSubmenuPayload,
  UpdateMenuSubmenuPayload,
} from '../types/menuSubmenu';

const BASE_URL = '/api/menu-submenu';

export async function getAllMenuSubmenus(): Promise<MenuSubmenuListResponse> {
  return api.getData<MenuSubmenuListResponse>(BASE_URL);
}

export async function getMenuSubmenuById(id: string): Promise<MenuItemDetail> {
  return api.getData<MenuItemDetail>(`${BASE_URL}/${id}`);
}

export async function createMenuSubmenu(payload: CreateMenuSubmenuPayload): Promise<MenuItem> {
  return api.postData<MenuItem>(BASE_URL, payload);
}

export async function updateMenuSubmenu(
  id: string,
  payload: UpdateMenuSubmenuPayload,
): Promise<MenuItem> {
  return api.putData<MenuItem>(`${BASE_URL}/${id}`, payload);
}

export async function patchMenuSubmenu(
  id: string,
  payload: PatchMenuSubmenuPayload,
): Promise<MenuItem> {
  return api.patchData<MenuItem>(`${BASE_URL}/${id}`, payload);
}

export async function deleteMenuSubmenu(id: string): Promise<MenuItem> {
  return api.deleteData<MenuItem>(`${BASE_URL}/${id}`);
}
