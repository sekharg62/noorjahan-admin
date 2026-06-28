import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios';
import { API_URL } from '../config/env';
import { STORAGE_KEYS } from '../constants/storage';
import { ApiError, type ApiResponse, type ApiResult } from '../types/api';

class ApiClient {
  private readonly http: AxiosInstance;

  constructor(baseURL: string) {
    this.http = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.http.interceptors.request.use((config) => {
      const authToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
      return config;
    });

    this.http.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);

          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      },
    );
  }

  private unwrap<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new ApiError(response.message);
    }
    return response.data;
  }

  private assertSuccess<T extends ApiResult>(response: T): T {
    if (!response.success) {
      throw new ApiError(response.message);
    }
    return response;
  }

  async getData<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.http.get<ApiResponse<T>>(url, config);
    return this.unwrap(data);
  }

  async postData<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.http.post<ApiResponse<T>>(url, body, config);
    return this.unwrap(data);
  }

  async putData<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.http.put<ApiResponse<T>>(url, body, config);
    return this.unwrap(data);
  }

  async patchData<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.http.patch<ApiResponse<T>>(url, body, config);
    return this.unwrap(data);
  }

  async deleteData<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.http.delete<ApiResponse<T>>(url, config);
    return this.unwrap(data);
  }

  async getResult<T extends ApiResult>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const { data } = await this.http.get<T>(url, config);
    return this.assertSuccess(data);
  }
}

export const api = new ApiClient(API_URL);

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? error.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
