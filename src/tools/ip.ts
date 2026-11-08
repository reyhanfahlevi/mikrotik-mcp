import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MikroTikClient } from "../client.js";

export function registerIpTools(server: McpServer, client: MikroTikClient) {
  server.tool(
    "mikrotik_get_ip_addresses",
    "List all IP addresses configured on the MikroTik router interfaces.",
    {
      interfaceName: z
        .string()
        .optional()
        .describe("Optional interface name filter (e.g. 'ether1', 'bridge')"),
    },
    async ({ interfaceName }) => {
      try {
        const addresses = await client.get<any[]>("/ip/address");
        let result = addresses;
        if (interfaceName) {
          result = addresses.filter(
            (item) => item.interface?.toLowerCase() === interfaceName.toLowerCase()
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
    "mikrotik_get_ip_routes",
    "List the routing table entries (static, connected, dynamic routes).",
    {
      activeOnly: z
        .boolean()
        .optional()
        .describe("Only show active routes if true"),
    },
    async ({ activeOnly }) => {
      try {
        const routes = await client.get<any[]>("/ip/route");
        let result = routes;
        if (activeOnly) {
          result = routes.filter((item) => item.active === "true" || item.active === true);
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
    "mikrotik_get_arp_table",
    "Get the ARP (Address Resolution Protocol) table to view IP to MAC address mappings.",
    {
      interfaceName: z
        .string()
        .optional()
        .describe("Filter by specific interface"),
      ipAddress: z
        .string()
        .optional()
        .describe("Filter by specific IP address"),
    },
    async ({ interfaceName, ipAddress }) => {
      try {
        const arp = await client.get<any[]>("/ip/arp");
        let result = arp;
        if (interfaceName) {
          result = result.filter(
            (item) => item.interface?.toLowerCase() === interfaceName.toLowerCase()
          );
        }
        if (ipAddress) {
          result = result.filter((item) => item.address === ipAddress);
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
}
