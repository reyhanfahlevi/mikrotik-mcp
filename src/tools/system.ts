import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MikroTikClient } from "../client.js";

export function registerSystemTools(server: McpServer, client: MikroTikClient) {
  server.tool(
    "mikrotik_get_system_resource",
    "Get MikroTik system resources including CPU load, memory usage, uptime, board name, and RouterOS version.",
    {},
    async () => {
      try {
        const resource = await client.get("/system/resource");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(resource, null, 2),
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
    "mikrotik_get_system_routerboard",
    "Get MikroTik RouterBOARD hardware details, model, serial number, and firmware version.",
    {},
    async () => {
      try {
        const routerboard = await client.get("/system/routerboard");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(routerboard, null, 2),
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
    "mikrotik_get_system_identity",
    "Get the MikroTik system identity / hostname.",
    {},
    async () => {
      try {
        const identity = await client.get("/system/identity");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(identity, null, 2),
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
    "mikrotik_reboot_system",
    "Reboot the MikroTik router. Requires confirmation flag.",
    {
      confirm: z
        .boolean()
        .describe("Explicit confirmation to reboot the router. Must be true."),
    },
    async ({ confirm }) => {
      if (!confirm) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "Reboot aborted: 'confirm' must be explicitly set to true.",
            },
          ],
        };
      }
      try {
        await client.post("/system/reboot", {});
        return {
          content: [
            {
              type: "text",
              text: "Reboot command successfully sent to MikroTik router.",
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
