export class ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
  meta: any;

  constructor(statusCode: number, message: string, data?: T, meta?: any) {
    this.statusCode = statusCode;
    this.data = data || null;
    this.message = message;
    this.success = statusCode >= 200 && statusCode < 300;
    this.meta = meta;
  }
}
