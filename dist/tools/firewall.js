import { z } from "zod";
export function registerFirewallTools(server, client) {
    server.tool("mikrotik_get_firewall_filter_rules", "List firewall filter rules with hit counters (packets, bytes) and configuration.", {
        chain: z
            .string()
            .optional()
            .describe("Optional chain filter (e.g. 'input', 'forward', 'output')"),
    }, async ({ chain }) => {
        try {
            const rules = await client.get("/ip/firewall/filter");
            let result = rules;
            if (chain) {
                result = result.filter((item) => item.chain && item.chain.toLowerCase() === chain.toLowerCase());
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
    server.tool("mikrotik_get_firewall_nat_rules", "List firewall NAT rules (masquerade, dstnat, srcnat).", {
        chain: z
            .string()
            .optional()
            .describe("Optional chain filter (e.g. 'srcnat', 'dstnat')"),
    }, async ({ chain }) => {
        try {
            const rules = await client.get("/ip/firewall/nat");
            let result = rules;
            if (chain) {
                result = result.filter((item) => item.chain && item.chain.toLowerCase() === chain.toLowerCase());
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
//# sourceMappingURL=firewall.js.map