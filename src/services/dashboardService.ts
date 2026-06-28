import { api } from '../lib/apiClient';
import type { DashboardStats } from '../types/dashboard';

const BASE_URL = '/api/dashboard';

export async function getDashboardStats(): Promise<DashboardStats> {
  return api.getData<DashboardStats>(BASE_URL);
}
