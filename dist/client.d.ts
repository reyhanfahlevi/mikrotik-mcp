import { MikroTikConfig } from "./types.js";
export declare class MikroTikClient {
    private config;
    private baseUrl;
    private authHeader;
    private agent;
    constructor(config: MikroTikConfig);
    request<T = any>(path: string, params?: Record<string, string | number | boolean>): Promise<T>;
    get<T = any>(path: string, params?: Record<string, string | number | boolean>): Promise<T>;
}
