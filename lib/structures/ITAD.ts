import axios from 'axios';
import { Seller } from '@prisma/client';
import { sleep } from '../util/helpers';
import log from '../util/logger';
import {
  APIErrorData,
  CollectionChartPayload,
  GameInfoPayload,
  GenericFunction,
  HistoricalLowPayload,
  PopularityChartPayload,
  PricesPayload,
  RegionStoresPayload,
  SearchPayload,
  SinglePlainPayload,
  WaitlistChartPayload,
} from '../util/types';

export class ITAD {
  private static BASE_URL = 'https://api.isthereanydeal.com';

  private _key: string;

  constructor(key: string) {
    this._key = key;
  }

  /**
   * Search for game by name
   */
  async search(game: string, limit: number): Promise<Record<string, any>[]> {
    return this._retry(async () => {
      const res = await this._getData<SearchPayload>('/v02/search/search/', {
        key: this._key,
        q: game,
        limit: limit.toString(),
        strict: '1',
      });

      const searchData = res.data?.data;
      const list = searchData?.results
        .filter((v, i, a) => i === a.findIndex((x) => x.title === v.title))
        .sort((a, b) => (a.title > b.title ? 1 : -1));

      return list;
    });
  }

  /**
   * Get ITAD game ID
   */
  async getGameId(game: string): Promise<string> {
    return this._retry(async () => {
      const res = await this._getData<SinglePlainPayload>('/v02/game/plain/', {
        key: this._key,
        title: game,
      });

      return res.data?.data?.plain;
    });
  }

  /**
   * Get game info from ID
   */
  async getGameInfo(gameId: string): Promise<Record<string, any>> {
    return this._retry(async () => {
      const res = await this._getData<GameInfoPayload>('/v01/game/info/', {
        key: this._key,
        plains: gameId,
      });

      return res.data?.data?.[gameId];
    });
  }

  /**
   * Get game prices and links
   */
  async getGameDeals(
    gameId: string,
    ignoredSellers: Seller[]
  ): Promise<Record<string, any>> {
    return this._retry(async () => {
      const res = await this._getData<PricesPayload>('/v01/game/prices/', {
        key: this._key,
        plains: gameId,
        region: 'us',
        country: 'US',
        exclude: ignoredSellers.map((x) => x.id).join(','),
      });

      return res.data?.data?.[gameId];
    });
  }

  /**
   * Get historical low for game
   */
  async getHistoricalLow(gameId: string): Promise<Record<string, any>> {
    return this._retry(async () => {
      const res = await this._getData<HistoricalLowPayload>(
        '/v01/game/lowest/',
        {
          key: this._key,
          plains: gameId,
          region: 'us',
          country: 'US',
        }
      );

      return res.data?.data?.[gameId];
    });
  }

  /**
   * Get all sellers
   */
  async getSellers(): Promise<Record<string, any>> {
    return this._retry(async () => {
      const res = await this._getData<RegionStoresPayload>('/v02/web/stores/', {
        region: 'us',
        country: 'US',
      });

      return res.data?.data;
    });
  }

  /**
   * Get top waitlisted games
   */
  async getWaitlistChart(limit: number): Promise<Record<string, any>[]> {
    return this._retry(async () => {
      const res = await this._getData<WaitlistChartPayload>(
        '/v01/stats/waitlist/chart/',
        {
          key: this._key,
          limit: limit,
        }
      );

      return res.data?.data;
    });
  }

  /**
   * Get top collected games
   */
  async getCollectionChart(limit: number): Promise<Record<string, any>[]> {
    return this._retry(async () => {
      const res = await this._getData<CollectionChartPayload>(
        '/v01/stats/collection/chart/',
        {
          key: this._key,
          limit: limit,
        }
      );

      return res.data?.data;
    });
  }

  /**
   * Get most popular games
   */
  async getPopularityChart(limit: number): Promise<Record<string, any>[]> {
    return this._retry(async () => {
      const res = await this._getData<PopularityChartPayload>(
        '/v01/stats/popularity/chart/',
        {
          key: this._key,
          limit: limit,
        }
      );

      return res.data?.data;
    });
  }

  private async _getData<T>(endpoint: string, payload: T): Promise<any> {
    const res = await axios.get(`${ITAD.BASE_URL}${endpoint}`, {
      params: payload,
    });
    return res;
  }

  private async _retry(
    fn: GenericFunction,
    retries = 3,
    interval = 1
  ): Promise<any> {
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
}
