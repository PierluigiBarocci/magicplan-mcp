import { z } from 'zod';
import { DISNEY_API_URL } from '../utils/constants.js';

const USER_AGENT = 'magicplan-mcp/1.0';

export const searchCharacterInputSchema = z.object({
  name: z
    .string()
    .describe('Disney character name to search, e.g. "Elsa" or "Mickey Mouse"'),
});

export type SearchCharacterOutput = {
  name: string;
  films: string[];
  tvShows: string[];
  parkAttractions: string[];
};

export interface DisneyAPIResponse {
  info: Info;
  data: DisneyAPICharacter[];
}

export interface DisneyAPICharacter {
  _id: number;
  films: string[];
  shortFilms: string[];
  tvShows: string[];
  videoGames: string[];
  parkAttractions: string[];
  allies: string[];
  enemies: string[];
  name: string;
  imageUrl: string;
  url: string;
}

export interface Info {
  count: number;
  totalPages: number;
  previousPage: string | null;
  nextPage: string | null;
}

export const convertToCharOutput = (
  raw: DisneyAPICharacter,
): SearchCharacterOutput => {
  return {
    name: raw.name,
    films: raw.films ?? [],
    tvShows: raw.tvShows ?? [],
    parkAttractions: raw.parkAttractions ?? [],
  };
};

export const searchCharacter = async (
  name: string,
): Promise<DisneyAPIResponse | null> => {
  const headers = {
    'User-Agent': USER_AGENT,
    Accept: 'application/json',
  };

  try {
    const response = await fetch(
      `${DISNEY_API_URL}/character?name=${encodeURIComponent(name)}`,
      { headers },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as DisneyAPIResponse;
  } catch (error) {
    console.error('Error fetching Disney character:', error);
    return null;
  }
};
