import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import os from "os";
// Create an MCP server
const server = new McpServer({
  name: "demo-server",
  version: "1.0.0"
});

// Add an addition tool
server.registerTool("add",
  {
    title: "Addition Tool",
    description: "Add two numbers",
    inputSchema: { a: z.number(), b: z.number() }
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);

// Add a dynamic greeting resource
server.registerResource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  { 
    title: "Greeting Resource",      // Display name for UI
    description: "Dynamic greeting generator"
  },
  async (uri, { name }) => ({
    contents: [{
      uri: uri.href,
      text: `Hello, ${name}!`
    }]
  })
);

server.registerTool(
  "getSystemInfo",
  {
    title: "System Information",
    description: "Get current system performance metrics",
  },
  async () => {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          platform: os.platform(),
          arch: os.arch(),
          cpuCount: os.cpus().length,
          freeMemory: os.freemem(),
          totalMemory: os.totalmem(),
          uptime: os.uptime(),
          loadAvg: os.loadavg(),
          networkInterfaces: os.networkInterfaces()
        }, null, 2)
      }]
    };
  }
);
// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);