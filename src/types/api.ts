export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ApiResult = {
  success: boolean;
  message: string;
};

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
