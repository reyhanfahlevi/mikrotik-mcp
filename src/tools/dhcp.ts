import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MikroTikClient } from "../client.js";

export function registerDhcpTools(server: McpServer, client: MikroTikClient) {
  server.tool(
    "mikrotik_get_dhcp_leases",
    "List DHCP server leases including active client IP addresses, MAC addresses, hostnames, and expiration times.",
    {
      hostname: z
        .string()
        .optional()
        .describe("Filter leases by hostname (partial match)"),
      status: z
        .string()
        .optional()
        .describe("Filter by status (e.g. 'bound', 'waiting', 'offered')"),
    },
    async ({ hostname, status }) => {
      try {
        const leases = await client.get<any[]>("/ip/dhcp-server/lease");
        let result = leases;
        if (hostname) {
          result = result.filter(
            (item) =>
              item["host-name"] &&
              item["host-name"].toLowerCase().includes(hostname.toLowerCase())
          );
        }
        if (status) {
          result = result.filter(
            (item) => item.status && item.status.toLowerCase() === status.toLowerCase()
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
    "mikrotik_make_dhcp_lease_static",
    "Convert a dynamic DHCP lease into a static lease reservation.",
    {
      leaseId: z.string().describe("The lease ID (e.g. '*1A')"),
    },
    async ({ leaseId }) => {
      try {
        const res = await client.post("/ip/dhcp-server/lease/make-static", {
          numbers: leaseId,
        });
        return {
          content: [
            {
              type: "text",
              text: `DHCP lease '${leaseId}' converted to static. Response: ${JSON.stringify(
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

  server.tool(
    "mikrotik_add_dhcp_static_lease",
    "Create a new static DHCP lease binding an IP address to a MAC address.",
    {
      address: z.string().describe("Client IP address, e.g. '192.168.88.50'"),
      macAddress: z.string().describe("Client MAC address, e.g. '00:11:22:33:44:55'"),
      serverName: z
        .string()
        .optional()
        .describe("DHCP server name (defaults to 'defconf' or all if omitted)"),
      comment: z.string().optional().describe("Description for the lease"),
    },
    async ({ address, macAddress, serverName, comment }) => {
      try {
        const payload: Record<string, string> = {
          address,
          "mac-address": macAddress,
        };
        if (serverName) payload.server = serverName;
        if (comment) payload.comment = comment;

        const res = await client.put("/ip/dhcp-server/lease", payload);
        return {
          content: [
            {
              type: "text",
              text: `Static DHCP lease created for ${address} (${macAddress}). Response: ${JSON.stringify(
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
