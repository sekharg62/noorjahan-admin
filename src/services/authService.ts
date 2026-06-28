import { api } from '../lib/apiClient';
import type { LoginCredentials, LoginResponse } from '../types/auth';

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return api.postData<LoginResponse>('/api/admin/auth/login', credentials);
}
