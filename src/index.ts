import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  getCharacterInfo,
  getCharacterAttractions,
  validateAPIResponse,
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
    description: `Look up a Disney character profile by name (disneyapi.dev). Use when the user wants a full overview: who the character is, which films and TV shows they appear in, or asks "tell me about X" / "who is X". Returns: name, films, tvShows, parkAttractions. Input: English character name (e.g. "Elsa", "Mickey Mouse"); partial names may not match. Do NOT use when the user only wants a list of park attractions; use get_character_attractions instead. Do NOT use for wait times, weather, or park maps.`,
    inputSchema: searchCharacterInputSchema,
  },
  async ({ name }) => {
    const characterData = await searchCharacter(name);
    const isCharacterNotFound = validateAPIResponse(characterData);

    if (isCharacterNotFound) {
      return {
        content: [
          {
            type: 'text',
            text: `No character found for "${name}"`,
          },
        ],
        isError: true,
      };
    }

    const character = getCharacterInfo(characterData!, name);

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

mcpServer.registerTool(
  'get_character_attractions',
  {
    description: `List theme park attractions featuring a Disney character (disneyapi.dev). Use when the user asks ONLY about park attractions, rides, shows, or parades for a character — e.g. "Which park attractions feature Elsa?", "What attractions is Mickey in?", "Where can I see Goofy in the park?". Returns: character name and parkAttractions only (no films or TV). Input: English character name, not a film title (map "Frozen" → "Elsa" or "Anna" first). Do NOT use for full character bios; use search_character instead. Do NOT use for wait times or weather.`,
    inputSchema: searchCharacterInputSchema,
  },
  async ({ name }) => {
    const characterData = await searchCharacter(name);
    const isCharacterNotFound = validateAPIResponse(characterData);

    if (isCharacterNotFound) {
      return {
        content: [
          {
            type: 'text',
            text: `No character found for "${name}"`,
          },
        ],
        isError: true,
      };
    }

    const { name: characterName, attractions } = getCharacterAttractions(
      characterData!,
      name,
    );

    if (attractions.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No attractions found for "${characterName}"`,
          },
        ],
      };
    }

    const attractionsText = `Character: ${characterName}\n\nPark Attractions: ${attractions.join('\n')}`;

    return {
      content: [
        {
          type: 'text',
          text: attractionsText,
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
