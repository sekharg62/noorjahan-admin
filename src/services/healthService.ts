import { api } from '../lib/apiClient';
import type { ApiResult } from '../types/api';

export type HealthResponse = ApiResult & {
  timestamp?: string;
};

export async function getHealth(): Promise<HealthResponse> {
  return api.getResult<HealthResponse>('/api/health');
}
