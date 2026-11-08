import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MikroTikClient } from "../client.js";

export function registerFirewallTools(server: McpServer, client: MikroTikClient) {
  server.tool(
    "mikrotik_get_firewall_filter_rules",
    "List firewall filter rules with hit counters (packets, bytes) and configuration.",
    {
      chain: z
        .string()
        .optional()
        .describe("Optional chain filter (e.g. 'input', 'forward', 'output')"),
    },
    async ({ chain }) => {
      try {
        const rules = await client.get<any[]>("/ip/firewall/filter");
        let result = rules;
        if (chain) {
          result = result.filter(
            (item) => item.chain && item.chain.toLowerCase() === chain.toLowerCase()
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
    "mikrotik_get_firewall_nat_rules",
    "List firewall NAT rules (masquerade, dstnat, srcnat).",
    {
      chain: z
        .string()
        .optional()
        .describe("Optional chain filter (e.g. 'srcnat', 'dstnat')"),
    },
    async ({ chain }) => {
      try {
        const rules = await client.get<any[]>("/ip/firewall/nat");
        let result = rules;
        if (chain) {
          result = result.filter(
            (item) => item.chain && item.chain.toLowerCase() === chain.toLowerCase()
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
    "mikrotik_toggle_firewall_rule",
    "Enable or disable a firewall rule (filter or nat) by ID.",
    {
      type: z
        .enum(["filter", "nat"])
        .describe("Firewall table type: 'filter' or 'nat'"),
      ruleId: z.string().describe("The rule ID, e.g. '*1' or rule position index"),
      disabled: z.boolean().describe("True to disable the rule, false to enable"),
    },
    async ({ type, ruleId, disabled }) => {
      try {
        const path = `/ip/firewall/${type}/${encodeURIComponent(ruleId)}`;
        const res = await client.patch(path, {
          disabled: disabled ? "true" : "false",
        });
        return {
          content: [
            {
              type: "text",
              text: `Firewall ${type} rule '${ruleId}' set to disabled=${disabled}. Response: ${JSON.stringify(
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
    "mikrotik_add_firewall_filter_rule",
    "Add a new firewall filter rule (e.g., to drop or accept specific traffic).",
    {
      chain: z
        .enum(["input", "forward", "output"])
        .describe("Firewall chain ('input', 'forward', 'output')"),
      action: z
        .enum(["accept", "drop", "reject", "log", "fasttrack-connection"])
        .describe("Action to take"),
      srcAddress: z
        .string()
        .optional()
        .describe("Source IP address or CIDR range (e.g. '192.168.1.100' or '10.0.0.0/8')"),
      dstAddress: z
        .string()
        .optional()
        .describe("Destination IP address or CIDR range"),
      protocol: z
        .string()
        .optional()
        .describe("Protocol, e.g. 'tcp', 'udp', 'icmp'"),
      dstPort: z
        .string()
        .optional()
        .describe("Destination port or port range, e.g. '80,443' or '22'"),
      comment: z.string().optional().describe("Comment / description for the rule"),
      placeBefore: z
        .string()
        .optional()
        .describe("Optional rule ID before which to place this new rule"),
    },
    async ({ chain, action, srcAddress, dstAddress, protocol, dstPort, comment, placeBefore }) => {
      try {
        const payload: Record<string, string> = {
          chain,
          action,
        };
        if (srcAddress) payload["src-address"] = srcAddress;
        if (dstAddress) payload["dst-address"] = dstAddress;
        if (protocol) payload.protocol = protocol;
        if (dstPort) payload["dst-port"] = dstPort;
        if (comment) payload.comment = comment;
        if (placeBefore) payload["place-before"] = placeBefore;

        const res = await client.put("/ip/firewall/filter", payload);
        return {
          content: [
            {
              type: "text",
              text: `Firewall filter rule added successfully. Response: ${JSON.stringify(
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
