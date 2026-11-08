import { z } from "zod";
export function registerDhcpTools(server, client) {
    server.tool("mikrotik_get_dhcp_leases", "List DHCP server leases including active client IP addresses, MAC addresses, hostnames, and expiration times.", {
        hostname: z
            .string()
            .optional()
            .describe("Filter leases by hostname (partial match)"),
        status: z
            .string()
            .optional()
            .describe("Filter by status (e.g. 'bound', 'waiting', 'offered')"),
    }, async ({ hostname, status }) => {
        try {
            const leases = await client.get("/ip/dhcp-server/lease");
            let result = leases;
            if (hostname) {
                result = result.filter((item) => item["host-name"] &&
                    item["host-name"].toLowerCase().includes(hostname.toLowerCase()));
            }
            if (status) {
                result = result.filter((item) => item.status && item.status.toLowerCase() === status.toLowerCase());
            }
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                isError: true,
                content: [{ type: "text", text: `Error: ${error.message}` }],
            };
        }
    });
}
//# sourceMappingURL=dhcp.js.map