export interface MikroTikConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  useSsl: boolean;
  rejectUnauthorized: boolean;
  timeoutMs: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}
