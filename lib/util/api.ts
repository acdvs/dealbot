import axios, { type AxiosResponse } from 'axios';

import { sleep } from './helpers';
import log from './logger';
import {
  APICall,
  APIErrorData,
  CollectionChartPayload,
  GameInfoPayload,
  GameLookupPayload,
  GameSearchPayload,
  HistoricalLowPayload,
  PopularityChartPayload,
  PricesPayload,
  ProtectedKeyPayload,
  RegionStoresPayload,
  WaitlistChartPayload,
} from './types';

const BASE_URL = 'https://api.isthereanydeal.com';
const API_KEY = process.env.API_KEY;

export default {
  /**
   * Search for games by title
   * https://docs.isthereanydeal.com/#tag/games/operation/games-search-v1
   */
  async search(game: string, limit = 20): Promise<Record<string, any>[]> {
    const res = await getDataProtected<GameSearchPayload>('/games/search/v1', {
      title: game,
      results: limit,
    });

    return res.data.sort((a, b) => (a.title > b.title ? 1 : -1));
  },
  /**
   * Lookup game based on title or Steam appid
   * https://docs.isthereanydeal.com/#tag/games/operation/games-lookup-v1
   */
  async getGameId(game: string): Promise<string> {
    const res = await getDataProtected<GameLookupPayload>('/games/lookup/v1', {
      title: game,
    });

    return res.data.game.id;
  },
  /**
   * Get basic game information
   * https://docs.isthereanydeal.com/#tag/games/operation/games-info-v2
   */
  async getGameInfo(gameId: string): Promise<Record<string, any>> {
    const res = await getDataProtected<GameInfoPayload>('/games/info/v2', {
      id: gameId,
    });

    return res.data.game;
  },
  /**
   * Get games' prices
   * https://docs.isthereanydeal.com/#tag/games/operation/games-prices-v2
   */
  async getGameDeals(gameId: string): Promise<Record<string, any>> {
    const res = await getDataProtected<PricesPayload>('/games/prices/v2', {
      country: 'US',
      capacity: 5,
      nondeals: false,
      vouchers: false,
    });

    return res.data[0].deals;
  },
  /**
   * Get historically lowest prices
   * https://docs.isthereanydeal.com/#tag/games/operation/games-historylow-v1
   */
  async getHistoricalLow(gameId: string): Promise<Record<string, any>> {
    const res = await getDataProtected<HistoricalLowPayload>(
      '/games/historylow/v1',
      {
        country: 'US',
      }
    );

    return res.data[0].low;
  },
  /**
   * Get all sellers
   * https://docs.isthereanydeal.com/#tag/service/operation/service-shops-v1
   */
  async getSellers(): Promise<Record<string, any>> {
    const res = await getData<RegionStoresPayload>('/service/shops/v1', {
      country: 'US',
    });

    return res.data;
  },
  /**
   * Get top waitlisted games
   * https://docs.isthereanydeal.com/#tag/stats/operation/stats-most-waitlisted-v1
   */
  async getWaitlistChart(limit = 20): Promise<Record<string, any>[]> {
    const res = await getDataProtected<WaitlistChartPayload>(
      '/stats/most-waitlisted/v1',
      {
        limit,
      }
    );

    return res.data;
  },
  /**
   * Get top collected games
   * https://docs.isthereanydeal.com/#tag/stats/operation/stats-most-collected-v1
   */
  async getCollectionChart(limit = 20): Promise<Record<string, any>[]> {
    const res = await getDataProtected<CollectionChartPayload>(
      '/stats/most-collected/v1',
      {
        limit,
      }
    );

    return res.data;
  },
  /**
   * Get most popular games
   * https://docs.isthereanydeal.com/#tag/stats/operation/stats-most-popular-v1
   */
  async getPopularityChart(limit = 20): Promise<Record<string, any>[]> {
    const res = await getDataProtected<PopularityChartPayload>(
      '/stats/most-popular/v1',
      {
        limit,
      }
    );

    return res.data;
  },
};

async function getData<T>(
  endpoint: string,
  payload: T
): Promise<AxiosResponse> {
  return retry(async () => {
    const res = await axios.get(`${BASE_URL}${endpoint}`, {
      params: payload,
    });

    return res.data;
  });
}

async function getDataProtected<T extends ProtectedKeyPayload>(
  endpoint: string,
  payload: Omit<T, 'key'>
): Promise<AxiosResponse> {
  return getData<T | ProtectedKeyPayload>(endpoint, {
    key: API_KEY as string,
    ...payload,
  });
}

async function retry(
  fn: APICall,
  retries = 3,
  interval = 1
): ReturnType<APICall> {
  let retried = false;
  let error;

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fn();

      if (retried) {
        log.msg(`Received response after ${i + 1} tries.`);
      }

      return res;
    } catch (e) {
      log.error(`ITAD API error. Retrying... (${i + 1})`);

      retried = true;
      error = e;

      await sleep(interval);
    }
  }

  log.error(`No response received after ${retries} attempts.`);
  throw new APIErrorData(error);
}
