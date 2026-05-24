import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  convertToCharOutput,
  searchCharacter,
  searchCharacterInputSchema,
} from './tools/characters.js';

// Create server instance
const mcpServer = new McpServer({
  name: 'magicplan-mcp',
  version: '1.0.0',
  description:
    'MCP-powered extraction and organization of Disneyland Paris visit data using live wait times, character, and weather APIs.',
});

// Register character tools
mcpServer.registerTool(
  'search_character',
  {
    description: `Look up a Disney character by name using the public disneyapi.dev API. Use when the user asks who a character is, which films or TV shows they appear in, or which theme park attractions feature them (e.g. "Who is Elsa?", "attractions of Mickey"). Returns: name, films, tvShows, parkAttractions. Input name: common English character name (e.g. "Elsa", "Mickey Mouse"); partial names may not match. Do not use for wait times, weather, or park maps; use other magicplan tools when available.`,
    inputSchema: searchCharacterInputSchema,
  },
  async ({ name }) => {
    const characterData = await searchCharacter(name);

    if (
      !characterData ||
      !characterData.data ||
      characterData.data.length === 0
    ) {
      return {
        content: [
          {
            type: 'text',
            text: `No character found for "${name}"`,
          },
        ],
      };
    }

    const characters = characterData.data.map(convertToCharOutput);
    const character =
      characters.find(
        (c) =>
          c.name.replace(/\s/g, '').toLowerCase() ===
          name.replace(/\s/g, '').toLowerCase(),
      ) ?? characters[0];

    const characterText = `Character: ${character.name}\n\nFilms: ${character.films.join('\n')}\n\nTV Shows: ${character.tvShows.join('\n')}\n\nPark Attractions: ${character.parkAttractions.join('\n')}`;

    return {
      content: [
        {
          type: 'text',
          text: characterText,
        },
      ],
    };
  },
);

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
