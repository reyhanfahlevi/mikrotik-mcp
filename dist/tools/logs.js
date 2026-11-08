import { z } from "zod";
export function registerLogTools(server, client) {
    server.tool("mikrotik_get_system_logs", "Retrieve recent system log entries from the MikroTik router.", {
        limit: z
            .number()
            .optional()
            .default(50)
            .describe("Maximum number of recent log entries to return (default: 50)"),
        topic: z
            .string()
            .optional()
            .describe("Filter logs containing a specific topic (e.g. 'error', 'firewall', 'dhcp', 'system', 'warning')"),
    }, async ({ limit, topic }) => {
        try {
            const logs = await client.get("/log");
            let result = logs;
            if (topic) {
                result = result.filter((item) => item.topics && item.topics.toLowerCase().includes(topic.toLowerCase()));
            }
            // Return the most recent entries
            if (limit && result.length > limit) {
                result = result.slice(-limit);
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
//# sourceMappingURL=logs.js.map