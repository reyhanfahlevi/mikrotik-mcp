import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MikroTikClient } from "../client.js";

export function registerInterfaceTools(server: McpServer, client: MikroTikClient) {
  server.tool(
    "mikrotik_list_interfaces",
    "List all network interfaces on the MikroTik router along with their status (running, disabled), type, and basic stats.",
    {
      type: z
        .string()
        .optional()
        .describe("Optional interface type filter (e.g. 'ether', 'bridge', 'vlan', 'wlan')"),
    },
    async ({ type }) => {
      try {
        const interfaces = await client.get<any[]>("/interface");
        let result = interfaces;
        if (type) {
          result = interfaces.filter(
            (item) => item.type?.toLowerCase() === type.toLowerCase()
          );
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
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

  server.tool(
    "mikrotik_get_interface_details",
    "Get detailed configuration and statistics for a specific interface by name or ID.",
    {
      nameOrId: z.string().describe("The interface name (e.g. 'ether1') or ID (e.g. '*1')"),
    },
    async ({ nameOrId }) => {
      try {
        const item = await client.get(`/interface/${encodeURIComponent(nameOrId)}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(item, null, 2),
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

  server.tool(
    "mikrotik_set_interface_state",
    "Enable or disable a network interface.",
    {
      nameOrId: z.string().describe("The interface name or ID"),
      disabled: z.boolean().describe("True to disable the interface, false to enable"),
    },
    async ({ nameOrId, disabled }) => {
      try {
        const res = await client.patch(`/interface/${encodeURIComponent(nameOrId)}`, {
          disabled: disabled ? "true" : "false",
        });
        return {
          content: [
            {
              type: "text",
              text: `Interface '${nameOrId}' state successfully set to disabled=${disabled}. Response: ${JSON.stringify(
                res
              )}`,
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
