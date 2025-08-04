// import axios, { AxiosError, Method } from 'axios';
import createClient from 'openapi-fetch';

import { APIError } from './error';
import type { paths } from './types';

const BASE_URL = 'https://api.isthereanydeal.com';
const API_KEY = process.env.ITAD_API_KEY;

const client = createClient<paths>({ baseUrl: BASE_URL });

// Search for games by title
export const search = async (game: string, limit = 20) => {
  const path = '/games/search/v1';
  const { data, error } = await client.GET(path, {
    params: {
      query: {
        key: API_KEY,
        title: game,
        results: limit,
      },
    },
  });

  if (error) throw new APIError(error, path);

  return data?.sort((a, b) => (a.title > b.title ? 1 : -1));
};

// Get basic game information
export const getGameInfo = async (gameId: string) => {
  const path = '/games/info/v2';
  const { data, error } = await client.GET(path, {
    params: {
      query: {
        key: API_KEY,
        id: gameId,
      },
    },
  });

  if (error) throw new APIError(error, path);

  return data;
};

// Get games' prices
export const getGamePrices = async (gameId: string, country: string) => {
  const path = '/games/prices/v3';
  const { data, error } = await client.POST(path, {
    params: {
      query: {
        key: API_KEY,
        country,
        capacity: 8,
        vouchers: true,
      },
    },
    body: [gameId],
  });

  if (error) throw new APIError(error, path);

  return data?.[0]?.deals || [];
};

// Get historically lowest prices
export const getHistoricalLow = async (gameId: string, country: string) => {
  const path = '/games/historylow/v1';
  const { data, error } = await client.POST(path, {
    params: {
      query: {
        key: API_KEY,
        country,
      },
    },
    body: [gameId],
  });

  if (error) throw new APIError(error, path);

  return data?.[0]?.low;
};

// Get all sellers
export const getSellers = async () => {
  const path = '/service/shops/v1';
  const { data, error } = await client.GET(path, {
    params: {
      query: {
        country: 'US',
      },
    },
  });

  if (error) throw new APIError(error, path);

  return data;
};

// Get top waitlisted games
export const getWaitlistChart = async (limit = 20) => {
  const path = '/stats/most-waitlisted/v1';
  const { data, error } = await client.GET(path, {
    params: {
      query: {
        key: API_KEY,
        offset: 0,
        limit,
      },
    },
  });

  if (error) throw new APIError(error, path);

  return data;
};

// Get top collected games
export const getCollectionChart = async (limit = 20) => {
  const path = '/stats/most-collected/v1';
  const { data, error } = await client.GET(path, {
    params: {
      query: {
        key: API_KEY,
        offset: 0,
        limit,
      },
    },
  });

  if (error) throw new APIError(error, path);

  return data;
};

// Get most popular games
export const getPopularityChart = async (limit = 20) => {
  const path = '/stats/most-popular/v1';
  const { data, error } = await client.GET(path, {
    params: {
      query: {
        key: API_KEY,
        offset: 0,
        limit,
      },
    },
  });

  if (error) throw new APIError(error, path);

  return data;
};
