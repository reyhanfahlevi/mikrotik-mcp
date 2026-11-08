import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MikroTikClient } from "../client.js";

export function registerRawTools(server: McpServer, client: MikroTikClient) {
  server.tool(
    "mikrotik_rest_request",
    "Execute an arbitrary RouterOS v7 REST API request. Use this to query or configure any RouterOS menu not covered by other specific tools (e.g. /queue/simple, /ip/dns, /system/clock, /routing/bgp, etc.).",
    {
      method: z
        .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
        .describe("HTTP method"),
      path: z
        .string()
        .describe("Path under /rest/ (e.g. 'ip/dns', 'queue/simple', 'system/clock', 'interface/bridge')"),
      body: z
        .record(z.any())
        .optional()
        .describe("JSON body for POST, PUT, or PATCH requests"),
      params: z
        .record(z.union([z.string(), z.number(), z.boolean()]))
        .optional()
        .describe("Query parameters for GET requests (e.g. { '.proplist': 'name,type' })"),
    },
    async ({ method, path, body, params }) => {
      try {
        const res = await client.request(method, path, body, params);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${error.message}` }],
        };
      }
    }
  );
}
