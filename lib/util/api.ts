import axios, { AxiosError, Method } from 'axios';

import { createBasicEmbed } from './helpers';
import { paths } from './itad';

const BASE_URL = 'https://api.isthereanydeal.com';
const API_KEY = process.env.API_KEY;

export default {
  /**
   * Search for games by title
   * https://docs.isthereanydeal.com/#tag/games/operation/games-search-v1
   */
  async search(game: string, limit = 20) {
    const data = await callApiProtected('get', '/games/search/v1', {
      params: {
        title: game,
        results: limit,
      },
    });

    return data?.sort((a, b) => (a.title > b.title ? 1 : -1));
  },
  /**
   * Lookup game based on title or Steam appid
   * https://docs.isthereanydeal.com/#tag/games/operation/games-lookup-v1
   */
  async getGameId(game: string) {
    const data = await callApiProtected('get', '/games/lookup/v1', {
      params: {
        title: game,
      },
    });

    return data?.game?.id;
  },
  /**
   * Get basic game information
   * https://docs.isthereanydeal.com/#tag/games/operation/games-info-v2
   */
  async getGameInfo(gameId: string) {
    const data = await callApiProtected('get', '/games/info/v2', {
      params: {
        id: gameId,
      },
    });

    return data;
  },
  /**
   * Get games' prices
   * https://docs.isthereanydeal.com/#tag/games/operation/games-prices-v2
   */
  async getGamePrices(gameId: string, all = false) {
    const data = await callApiProtected('post', '/games/prices/v2', {
      params: {
        country: 'US',
        capacity: 8,
        vouchers: false,
        nondeals: all,
      },
      data: [gameId],
    });

    return data?.[0].deals;
  },
  /**
   * Get historically lowest prices
   * https://docs.isthereanydeal.com/#tag/games/operation/games-historylow-v1
   */
  async getHistoricalLow(gameId: string) {
    const data = await callApiProtected('post', '/games/historylow/v1', {
      params: {
        country: 'US',
      },
      data: [gameId],
    });

    return data?.[0].low;
  },
  /**
   * Get all sellers
   * https://docs.isthereanydeal.com/#tag/service/operation/service-shops-v1
   */
  async getSellers() {
    const data = await callApi('get', '/service/shops/v1', {
      params: {
        country: 'US',
      },
    });

    return data;
  },
  /**
   * Get top waitlisted games
   * https://docs.isthereanydeal.com/#tag/stats/operation/stats-most-waitlisted-v1
   */
  async getWaitlistChart(limit = 20) {
    const data = await callApiProtected('get', '/stats/most-waitlisted/v1', {
      params: {
        offset: 0,
        limit,
      },
    });

    return data;
  },
  /**
   * Get top collected games
   * https://docs.isthereanydeal.com/#tag/stats/operation/stats-most-collected-v1
   */
  async getCollectionChart(limit = 20) {
    const data = await callApiProtected('get', '/stats/most-collected/v1', {
      params: {
        offset: 0,
        limit,
      },
    });

    return data;
  },
  /**
   * Get most popular games
   * https://docs.isthereanydeal.com/#tag/stats/operation/stats-most-popular-v1
   */
  async getPopularityChart(limit = 20) {
    const data = await callApiProtected('get', '/stats/most-popular/v1', {
      params: {
        offset: 0,
        limit,
      },
    });

    return data;
  },
};

type APIMethod<P extends keyof paths> = keyof paths[P] & Method;

type APIParams<
  P extends keyof paths,
  M extends APIMethod<P>
> = paths[P][M] extends { parameters }
  ? {
      params: paths[P][M]['parameters']['query'];
    }
  : never;

type APIData<
  P extends keyof paths,
  M extends APIMethod<P>
> = paths[P][M] extends { requestBody }
  ? {
      data: paths[P][M]['requestBody']['content']['application/json'];
    }
  : never;

type APIResponse<
  P extends keyof paths,
  M extends APIMethod<P>
> = paths[P][M] extends { responses }
  ? paths[P][M]['responses']['200']['content']['application/json']
  : never;

async function callApi<P extends keyof paths, M extends APIMethod<P>>(
  method: M,
  endpoint: P,
  query: APIParams<P, M> | APIData<P, M>
) {
  try {
    const res = await axios.request<APIResponse<P, M>>({
      method,
      url: `${BASE_URL}${endpoint}`,
      ...('params' in query ? { params: query.params } : {}),
      ...('data' in query ? { data: query.data } : {}),
    });

    return res.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      throw new APIError(err);
    }
  }
}

async function callApiProtected<P extends keyof paths, M extends APIMethod<P>>(
  method: M,
  endpoint: P,
  query: APIParams<P, M> | APIData<P, M>
) {
  if ('params' in query) {
    query.params.key = API_KEY as string;
  }

  return callApi(method, endpoint, query);
}

export class APIError {
  raw: AxiosError;

  code?: number;
  message?: string;
  path?: string;
  hasAllData: boolean;

  constructor(error: AxiosError) {
    this.raw = error;

    this.code = error.response?.status;
    this.message = error.response?.statusText;
    this.path = error.response?.request.path;
    this.hasAllData = !!this.code && !!this.message && !!this.path;
  }

  json() {
    return {
      code: this.code || 0,
      message: this.message || '',
      path: this.path || '',
    };
  }

  asEmbed() {
    return createBasicEmbed(
      `Unable to get info from IsThereAnyDeal. Please try again later. (Code: ${
        this.code || 0
      })`
    );
  }
}
