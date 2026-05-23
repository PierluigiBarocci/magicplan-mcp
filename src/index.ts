import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Create server instance
const mcpServer = new McpServer({
  name: 'magicplan-mcp',
  version: '1.0.0',
  description:
    'MCP-powered extraction and organization of Disneyland Paris visit data using live wait times, character, and weather APIs.',
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.error('Magicplan MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
