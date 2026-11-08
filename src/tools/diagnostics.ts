import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MikroTikClient } from "../client.js";

export function registerDiagnosticsTools(server: McpServer, client: MikroTikClient) {
  server.tool(
    "mikrotik_ping",
    "Ping a remote IPv4/IPv6 address or domain from the MikroTik router.",
    {
      address: z.string().describe("Target IP address or hostname to ping, e.g. '8.8.8.8'"),
      count: z
        .number()
        .optional()
        .default(4)
        .describe("Number of ping packets to send (default: 4)"),
      interfaceName: z
        .string()
        .optional()
        .describe("Optional outgoing interface to ping from"),
    },
    async ({ address, count, interfaceName }) => {
      try {
        const payload: Record<string, any> = {
          address,
          count: count || 4,
        };
        if (interfaceName) payload.interface = interfaceName;

        const res = await client.post("/ping", payload);
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
