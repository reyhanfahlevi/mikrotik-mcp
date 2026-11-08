import { Agent } from "undici";
export class MikroTikClient {
    config;
    baseUrl;
    authHeader;
    agent;
    constructor(config) {
        this.config = config;
        const protocol = config.useSsl ? "https" : "http";
        this.baseUrl = `${protocol}://${config.host}:${config.port}/rest`;
        const credentials = Buffer.from(`${config.username}:${config.password}`).toString("base64");
        this.authHeader = `Basic ${credentials}`;
        this.agent = new Agent({
            connect: {
                rejectUnauthorized: config.rejectUnauthorized,
            },
        });
    }
    async request(path, params) {
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
        const headers = {
            Authorization: this.authHeader,
            Accept: "application/json",
        };
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);
        try {
            const response = await fetch(url.toString(), {
                method: "GET",
                headers,
                signal: controller.signal,
                // @ts-ignore undici dispatcher
                dispatcher: this.agent,
            });
            const responseText = await response.text();
            let responseData;
            try {
                responseData = responseText ? JSON.parse(responseText) : null;
            }
            catch {
                responseData = responseText;
            }
            if (!response.ok) {
                const errorDetail = typeof responseData === "object" && responseData !== null
                    ? responseData.detail || responseData.message || JSON.stringify(responseData)
                    : responseText || response.statusText;
                throw new Error(`MikroTik API Error [HTTP ${response.status} ${response.statusText}]: ${errorDetail}`);
            }
            return responseData;
        }
        catch (err) {
            if (err.name === "AbortError") {
                throw new Error(`MikroTik API Request timed out after ${this.config.timeoutMs}ms for GET ${url.pathname}`);
            }
            throw err;
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
    get(path, params) {
        return this.request(path, params);
    }
}
//# sourceMappingURL=client.js.map