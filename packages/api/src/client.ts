// https://docs.isthereanydeal.com

import createClient from 'openapi-fetch';

import middleware from './middleware';
import type { paths } from '../types';

type APIMember = keyof InstanceType<typeof APIClient>;
export type APIMethod<Fn extends APIMember> = Awaited<
  ReturnType<APIClient[Fn]>
>;

export default class APIClient {
  private static readonly BASE_URL = 'https://api.isthereanydeal.com';

  private readonly apiKey;
  private readonly client;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = createClient<paths>({ baseUrl: APIClient.BASE_URL });

    this.client.use(middleware);
  }

  // Search for games by title
  async search(game: string, limit = 20) {
    const { data } = await this.client.GET('/games/search/v1', {
      params: {
        query: {
          key: this.apiKey,
          title: game,
          results: limit,
        },
      },
    });

    return data?.sort((a, b) => (a.title > b.title ? 1 : -1));
  }

  // Get basic game information
  async getGameInfo(gameId: string) {
    const { data } = await this.client.GET('/games/info/v2', {
      params: {
        query: {
          key: this.apiKey,
          id: gameId,
        },
      },
    });

    return data;
  }

  // Get games' prices
  async getGamePrices(gameId: string, country: string) {
    const { data } = await this.client.POST('/games/prices/v3', {
      params: {
        query: {
          key: this.apiKey,
          country,
          capacity: 8,
          vouchers: true,
        },
      },
      body: [gameId],
    });

    return data?.[0]?.deals || [];
  }

  // Get historically lowest prices
  async getHistoricalLow(gameId: string, country: string) {
    const { data } = await this.client.POST('/games/historylow/v1', {
      params: {
        query: {
          key: this.apiKey,
          country,
        },
      },
      body: [gameId],
    });

    return data?.[0]?.low;
  }

  // Get all sellers
  async getSellers() {
    const { data } = await this.client.GET('/service/shops/v1', {
      params: {
        query: {
          country: 'US',
        },
      },
    });

    return data;
  }

  // Get top waitlisted games
  async getWaitlistChart(limit = 20) {
    const { data } = await this.client.GET('/stats/most-waitlisted/v1', {
      params: {
        query: {
          key: this.apiKey,
          offset: 0,
          limit,
        },
      },
    });

    return data;
  }

  // Get top collected games
  async getCollectionChart(limit = 20) {
    const { data } = await this.client.GET('/stats/most-collected/v1', {
      params: {
        query: {
          key: this.apiKey,
          offset: 0,
          limit,
        },
      },
    });

    return data;
  }

  // Get most popular games
  async getPopularityChart(limit = 20) {
    const { data } = await this.client.GET('/stats/most-popular/v1', {
      params: {
        query: {
          key: this.apiKey,
          offset: 0,
          limit,
        },
      },
    });

    return data;
  }
}
