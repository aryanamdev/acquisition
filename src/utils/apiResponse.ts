export class ApiResponse<T, M = unknown> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
  meta: M | null;

  constructor(statusCode: number, message: string, data?: T, meta?: M) {
    this.statusCode = statusCode;
    this.data = data ?? null;
    this.message = message;
    this.success = statusCode >= 200 && statusCode < 300;
    this.meta = meta ?? null;
  }
}
