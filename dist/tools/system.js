export function registerSystemTools(server, client) {
    server.tool("mikrotik_get_system_resource", "Get MikroTik system resources including CPU load, memory usage, uptime, board name, and RouterOS version.", {}, async () => {
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
        }
        catch (error) {
            return {
                isError: true,
                content: [{ type: "text", text: `Error: ${error.message}` }],
            };
        }
    });
    server.tool("mikrotik_get_system_routerboard", "Get MikroTik RouterBOARD hardware details, model, serial number, and firmware version.", {}, async () => {
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
        }
        catch (error) {
            return {
                isError: true,
                content: [{ type: "text", text: `Error: ${error.message}` }],
            };
        }
    });
    server.tool("mikrotik_get_system_identity", "Get the MikroTik system identity / hostname.", {}, async () => {
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
        }
        catch (error) {
            return {
                isError: true,
                content: [{ type: "text", text: `Error: ${error.message}` }],
            };
        }
    });
}
//# sourceMappingURL=system.js.map