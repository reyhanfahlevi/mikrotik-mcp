import { Agent } from "undici";
import { MikroTikConfig } from "./types.js";

export class MikroTikClient {
  private config: MikroTikConfig;
  private baseUrl: string;
  private authHeader: string;
  private agent: Agent;

  constructor(config: MikroTikConfig) {
    this.config = config;
    const protocol = config.useSsl ? "https" : "http";
    this.baseUrl = `${protocol}://${config.host}:${config.port}/rest`;

    const credentials = Buffer.from(
      `${config.username}:${config.password}`
    ).toString("base64");
    this.authHeader = `Basic ${credentials}`;

    this.agent = new Agent({
      connect: {
        rejectUnauthorized: config.rejectUnauthorized,
      },
    });
  }

  public async request<T = any>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    body?: any,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    // Clean up path
    const cleanPath = path.startsWith("/rest/")
      ? path.replace("/rest", "")
      : path.startsWith("/")
      ? path
      : `/${path}`;

    const url = new URL(`${this.baseUrl}${cleanPath}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      Authorization: this.authHeader,
      Accept: "application/json",
    };

    let bodyStr: string | undefined;
    if (body !== undefined && body !== null) {
      headers["Content-Type"] = "application/json";
      bodyStr = JSON.stringify(body);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: bodyStr,
        signal: controller.signal,
        // @ts-ignore undici dispatcher
        dispatcher: this.agent,
      });

      const responseText = await response.text();
      let responseData: any;
      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch {
        responseData = responseText;
      }

      if (!response.ok) {
        const errorDetail =
          typeof responseData === "object" && responseData !== null
            ? responseData.detail || responseData.message || JSON.stringify(responseData)
            : responseText || response.statusText;

        throw new Error(
          `MikroTik API Error [HTTP ${response.status} ${response.statusText}]: ${errorDetail}`
        );
      }

      return responseData as T;
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new Error(
          `MikroTik API Request timed out after ${this.config.timeoutMs}ms for ${method} ${url.pathname}`
        );
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public get<T = any>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    return this.request<T>("GET", path, undefined, params);
  }

  public post<T = any>(path: string, body?: any): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  public put<T = any>(path: string, body?: any): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  public patch<T = any>(path: string, body?: any): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }

  public delete<T = any>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }
}
