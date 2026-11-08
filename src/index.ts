#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { MikroTikClient } from "./client.js";
import { registerSystemTools } from "./tools/system.js";
import { registerInterfaceTools } from "./tools/interfaces.js";
import { registerIpTools } from "./tools/ip.js";
import { registerDhcpTools } from "./tools/dhcp.js";
import { registerFirewallTools } from "./tools/firewall.js";
import { registerDiagnosticsTools } from "./tools/diagnostics.js";
import { registerLogTools } from "./tools/logs.js";
import { registerRawTools } from "./tools/raw.js";

async function main() {
  const config = loadConfig();
  const client = new MikroTikClient(config);

  const server = new McpServer({
    name: "mikrotik-mcp",
    version: "0.1.0",
  });

  // Register all tool modules
  registerSystemTools(server, client);
  registerInterfaceTools(server, client);
  registerIpTools(server, client);
  registerDhcpTools(server, client);
  registerFirewallTools(server, client);
  registerDiagnosticsTools(server, client);
  registerLogTools(server, client);
  registerRawTools(server, client);

  // Stdio transport for MCP
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(
    `[mikrotik-mcp] Server running via stdio. Connected target: ${
      config.useSsl ? "https" : "http"
    }://${config.host}:${config.port}`
  );
}

main().catch((error) => {
  console.error("[mikrotik-mcp] Fatal error:", error);
  process.exit(1);
});
