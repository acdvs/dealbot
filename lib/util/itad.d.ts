/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

/** OneOf type helpers */
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;
type OneOf<T extends any[]> = T extends [infer Only]
  ? Only
  : T extends [infer A, infer B, ...infer Rest]
  ? OneOf<[XOR<A, B>, ...Rest]>
  : never;

export interface paths {
  '/service/shops/v1': {
    /**
     * Shops
     * @description Return information about shops
     */
    get: operations['service-shops-v1'];
  };
  '/deals/v2': {
    /**
     * Deals List
     * @description Get current deals. Follows same rules as deals list displayed on the website, which means that
     * you will not get one game more than once in the list.
     *
     * For each game, the best price is displayed, ignoring stores that currently don't have game on sale,
     * even if they currently have a better price.
     */
    get: operations['deals-v2'];
  };
  '/games/lookup/v1': {
    /**
     * Game Lookup
     * @description Lookup game based on title or Steam appid
     */
    get: operations['games-lookup-v1'];
  };
  '/games/search/v1': {
    /**
     * Game Search
     * @description Search for games by title
     */
    get: operations['games-search-v1'];
  };
  '/games/info/v2': {
    /**
     * Game Info
     * @description Get basic game information
     */
    get: operations['games-info-v2'];
  };
  '/games/prices/v2': {
    /**
     * Prices
     * @description Get games' prices
     */
    post: operations['games-prices-v2'];
  };
  '/games/historylow/v1': {
    /**
     * History Low
     * @description Get historically lowest prices
     */
    post: operations['games-historylow-v1'];
  };
  '/games/storelow/v2': {
    /**
     * Store Low
     * @description Get historically lowest prices for individual stores
     */
    post: operations['games-storelow-v2'];
  };
  '/games/bundles/v2': {
    /**
     * Bundles including Game
     * @description Get all bundles which contain the game
     */
    get: operations['games-bundles-v2'];
  };
  '/games/overview/v2': {
    /**
     * Price Overview
     * @description Get basic price overview for selected games.
     *
     * For each game current best price will be loaded (optionally, only from selected shops),
     * historical low price (among all covered shops).
     *
     * Furthermore, result will also contain list of currently active bundles,
     * which contain at least one of the queried games.
     */
    post: operations['games-overview-v2'];
  };
  '/games/history/v2': {
    /**
     * History log
     * @description Get log of historical prices
     */
    get: operations['games-history-v2'];
  };
  '/waitlist/games/v1': {
    /**
     * Games in Waitlist
     * @description Get games in user's Waitlist
     */
    get: operations['waitlist-games-v1-get'];
    /**
     * Add to Waitlist
     * @description Add games to user's Waitlist
     */
    put: operations['waitlist-games-v1-put'];
    /**
     * Delete from Waitlist
     * @description Delete games from user's Waitlist
     */
    delete: operations['waitlist-games-v1-delete'];
  };
  '/collection/games/v1': {
    /**
     * Games in Collection
     * @description Get games in user's Collection
     */
    get: operations['collection-games-v1-get'];
    /**
     * Add to Collection
     * @description Add games to user's Collection
     */
    put: operations['collection-games-v1-put'];
    /**
     * Delete from Collection
     * @description Delete games from user's Collection
     */
    delete: operations['collection-games-v1-delete'];
  };
  '/stats/waitlist/v1': {
    /**
     * Waitlist Stats
     * @description Get Waitlist statistics for a game
     *
     * > Note: stats do not take into consideration users' regions.
     * > If they have set their price limit to be a historical low, stats will be computed
     * > for all users as if they were in the region you specify
     */
    get: operations['stats-waitlist-v1'];
  };
  '/stats/most-waitlisted/v1': {
    /**
     * Most Waitlisted
     * @description Get list of most Waitlisted games
     */
    get: operations['stats-most-waitlisted-v1'];
  };
  '/stats/most-collected/v1': {
    /**
     * Most Collected
     * @description Get list of most Collected games
     */
    get: operations['stats-most-collected-v1'];
  };
  '/stats/most-popular/v1': {
    /**
     * Most Popular
     * @description Get list of most popular games. Popularity for each game is computed as Waitlisted count + Collected count.
     */
    get: operations['stats-most-popular-v1'];
  };
  '/user/info/v2': {
    /**
     * User Info
     * @description Get user info, currently just a username
     */
    get: operations['user-info-v2'];
  };
  '/unstable/id-lookup/shop/{shopId}/v2': {
    /**
     * Lookup Shop's Game IDs
     * @description Lookup shop's game IDs by IsThereAnyDeal game IDs
     */
    post: operations['unstable-idlookup-shop-v2'];
  };
  '/unstable/id-lookup/itad/{shopId}/v2': {
    /**
     * Lookup Game IDs
     * @description Lookup IsThereAnyDeal's game IDs by shop's game IDs
     */
    post: operations['unstable-idlookup-itad-v2'];
  };
  '/internal/early-access/v1': {
    /**
     * Early Access Games
     * @description Returns list of Steam appids, which are currently considered to be early in early access
     */
    get: operations['internal-earlyaccess-v1'];
  };
  '/internal/players/v1': {
    /** Number of Players Statistics */
    get: operations['internal-players-v1'];
  };
  '/internal/htlb/v1': {
    /** HowLongToBeat Overview */
    get: operations['internal-hltb-v1'];
  };
  '/internal/reviews/v1': {
    /**
     * Reviews Score
     * @description Returns Metacritic user reviews overview and OpenCritic overview for a given game
     */
    get: operations['internal-reviews-v1'];
  };
  '/internal/rates/v1': {
    /** Conversion Rates */
    get: operations['internal-rates-v1'];
  };
  '/internal/twitch/stream/v1': {
    /** Current stream of Twitch channel */
    get: operations['internal-twitchstream-v1'];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    /** Shops response */
    'resp.service.shops': {
      id: number;
      title: string;
      deals: number;
      games: number;
      /** Format: date-time */
      update: string | null;
    }[];
    /** Game Type */
    'obj.game-type': ('game' | 'dlc' | 'package') | null;
    /** Shop */
    'obj.shop': {
      id: number;
      name: string;
    };
    /** Price */
    'obj.price': {
      amount: number;
      amountInt: number;
      currency: string;
    };
    /** Deal Flag */
    'obj.deal-flag': ('H' | 'N' | 'S') | null;
    /** DRM */
    'obj.drm': {
      id: number;
      name: string;
    };
    /** DRM List */
    'obj.drm-list': components['schemas']['obj.drm'][];
    /** Platform */
    'obj.platform': {
      id: number;
      name: string;
    };
    /** Platform List */
    'obj.platform-list': components['schemas']['obj.platform'][];
    /** Deal */
    'obj.deal': {
      shop: components['schemas']['obj.shop'];
      price: components['schemas']['obj.price'];
      regular: components['schemas']['obj.price'];
      cut: number;
      voucher: string | null;
      storeLow: null | components['schemas']['obj.price'];
      historyLow: null | components['schemas']['obj.price'];
      flag: components['schemas']['obj.deal-flag'];
      drm: components['schemas']['obj.drm-list'];
      platforms: components['schemas']['obj.platform-list'];
      /** Format: date-time */
      timestamp: string;
      /** Format: date */
      expiry: string | null;
      /** Format: uri */
      url: string;
    };
    /** Deals Response */
    'resp.deals': {
      /** Format: int32 */
      nextOffset: number;
      hasMore: boolean;
      list: {
        /** Format: uuid */
        id: string;
        slug: string;
        title: string;
        type: components['schemas']['obj.game-type'];
        deal: components['schemas']['obj.deal'];
      }[];
    };
    /** Game */
    'obj.game': {
      /** Format: uuid */
      id: string;
      slug: string;
      title: string;
      type: components['schemas']['obj.game-type'];
      mature: boolean;
    };
    /** Game Lookup Response */
    'resp.games.lookup': {
      found: boolean;
      game?: components['schemas']['obj.game'];
    };
    /** Game Search Response */
    'resp.games.search': components['schemas']['obj.game'][];
    /** Company */
    'obj.company': {
      id: number;
      name: string;
    };
    /** Reviews */
    'obj.reviews': {
      score: number | null;
      source: string;
      count: number | null;
      /** Format: uri */
      url: string;
    };
    /** Game Info Response */
    'resp.games.info': {
      /** Format: uuid */
      id: string;
      slug: string;
      title: string;
      type: components['schemas']['obj.game-type'];
      mature: boolean;
      assets: {
        banner145?: string;
        banner300?: string;
        banner400?: string;
        banner600?: string;
        boxart?: string;
      };
      earlyAccess: boolean;
      achievements: boolean;
      tradingCards: boolean;
      appid: number | null;
      tags: string[];
      /** Format: date */
      releaseDate: string | null;
      developers: components['schemas']['obj.company'][];
      publishers: components['schemas']['obj.company'][];
      reviews: components['schemas']['obj.reviews'][];
      stats: {
        rank?: number;
        waitlisted?: number;
        collected?: number;
      };
      players: OneOf<
        [
          {
            recent: number;
            day: number;
            week: number;
            peak: number;
          },
          null
        ]
      >;
      urls: {
        /** Format: uri */
        game: string;
      };
    };
    /** Prices Response */
    'resp.games.prices': {
      /**
       * Format: uuid
       * @description Game ID
       */
      id: string;
      deals: components['schemas']['obj.deal'][];
    }[];
    /** Historical Low */
    'obj.historylow': {
      shop: components['schemas']['obj.shop'];
      price: components['schemas']['obj.price'];
      regular: components['schemas']['obj.price'];
      cut: number;
      /** Format: date-time */
      timestamp: string;
    };
    /** Historical Lows Response */
    'resp.games.historylow': {
      /** Format: uuid */
      id: string;
      low: components['schemas']['obj.historylow'];
    }[];
    /** Store Lows Response */
    'resp.games.storelow': {
      /** Format: uuid */
      id: string;
      lows: {
        shop: components['schemas']['obj.shop'];
        price: components['schemas']['obj.price'];
        regular: components['schemas']['obj.price'];
        cut: number;
        /** Format: date-time */
        timestamp: string;
      }[];
    }[];
    /** Bundle */
    'obj.bundle': {
      id: number;
      title: string;
      page: {
        id: number;
        name: string;
        shopId?: number | null;
      };
      /** Format: uri */
      url: string;
      /** Format: uri */
      details?: string;
      isMature: boolean;
      /** Format: date-time */
      publish: string;
      /** Format: date-time */
      expiry: string | null;
      counts: {
        games: number;
        media: number;
      };
      tiers: {
        price: components['schemas']['obj.price'] | null;
        games: components['schemas']['obj.game'][];
      }[];
    };
    /** Bundles with Game Response */
    'resp.games.bundles': components['schemas']['obj.bundle'][];
    /**
     * Overview Deal
     * @description This object is basically the same as regular Deal, difference being storeLow and historyLow properties are not included
     */
    'obj.deal-overview': {
      shop: components['schemas']['obj.shop'];
      price: components['schemas']['obj.price'];
      regular: components['schemas']['obj.price'];
      cut: number;
      voucher: string | null;
      flag: components['schemas']['obj.deal-flag'];
      drm: components['schemas']['obj.drm-list'];
      platforms: components['schemas']['obj.platform-list'];
      /** Format: date-time */
      timestamp: string;
      /** Format: date */
      expiry: string | null;
      /** Format: uri */
      url: string;
    };
    /** Games Overview Response */
    'resp.games.overview': {
      prices: {
        /** Format: uuid */
        id: string;
        current: components['schemas']['obj.deal-overview'] | null;
        lowest: components['schemas']['obj.historylow'] | null;
        bundled: number;
        urls: {
          /** Format: uri */
          game: string;
        };
      }[];
      bundles: components['schemas']['obj.bundle'][];
    };
    /** History response */
    'resp.games.history': {
      /** Format: date-time */
      timestamp: string;
      shop: components['schemas']['obj.shop'];
      deal: OneOf<
        [
          {
            price: components['schemas']['obj.price'];
            regular: components['schemas']['obj.price'];
            cut: number;
          },
          null
        ]
      >;
    }[];
    /** Waitlist Games Response */
    'resp.waitlist.games': components['schemas']['obj.game'][];
    /** Collection Games Response */
    'resp.collection.games': components['schemas']['obj.game'][];
    bucket: {
      bucket: number;
      count: number;
      percentile: number;
    };
    /** Waitlist Stats Response */
    'resp.stats.waitlist': {
      count: number;
      price: {
        /** @description Currency in which the prices are listed */
        currency: string;
        /** @description How many users did not set price limit */
        any: number;
        average: number;
        buckets: components['schemas']['bucket'][];
      };
      cut: {
        average: number;
        buckets: components['schemas']['bucket'][];
      };
      $defs: {
        bucket: {
          bucket: number;
          count: number;
          percentile: number;
        };
      };
    };
    /** Ramled Game */
    'obj.game-ranked': {
      position: number;
      /** Format: uuid */
      id: string;
      slug: string;
      title: string;
      type: components['schemas']['obj.game-type'];
      mature: boolean;
      count: number;
    };
    /** Ranked Games Response */
    'resp.stats.ranked-games': components['schemas']['obj.game-ranked'][];
    /** User Info Response */
    'resp.user.info': {
      username: string | null;
    };
    /** Shop IDs Lookup Response */
    'resp.unstable.idlookup-shop': Record<string, never>;
    /** Game IDs Lookup Response */
    'resp.unstable.idlookup-game': Record<string, never>;
    /** Players Statistics Response */
    'resp.internal.players': {
      current: number;
      day: number;
      peak: number;
    };
    /** HowLongToBeat Overview Response */
    'resp.internal.hltb': {
      id: number;
      main: null | number;
      extra: null | number;
      complete: null | number;
    };
    /** Reviews Overview Response */
    'resp.internal.reviews': {
      metauser: OneOf<
        [
          {
            score?: number | null;
            verdict?: string | null;
            /** Format: uri */
            url?: string;
          },
          null
        ]
      >;
      opencritic: OneOf<
        [
          {
            score?: number | null;
            verdict?: string | null;
            /** Format: uri */
            url?: string;
          },
          null
        ]
      >;
    };
    /** Currency Rates Response */
    'resp.internal.rates': {
      from: string;
      to: string;
      rate: number;
    }[];
    'resp.internal.twitchstream': OneOf<
      [
        {
          user_name: string;
          title: string;
          thumbnail_url: string;
          viewer_count: number;
          game: string;
        },
        null
      ]
    >;
  };
  responses: {
    /** @description Error response */
    'error-response': {
      content: {
        'application/json': {
          /** @description HTTP status code */
          status_code: number;
          /** @description Error description */
          reason_phrase: string;
        };
      };
    };
  };
  parameters: {
    /** @description Two letter country code (ISO 3166-1 alpha-2) */
    country?: string;
    /** @description Game ID */
    gid: string;
    /** @description List of shop IDs */
    shops?: number[];
  };
  requestBodies: {
    /** @description List of Game IDs */
    gids?: {
      content: {
        /**
         * @example [
         *   "01849783-6a26-7147-ab32-71804ca47e8e",
         *   "01849782-1017-7389-8de4-c97c587fd7e3"
         * ]
         */
        'application/json': string[];
      };
    };
    /** @description List of Game IDs */
    'gids-200'?: {
      content: {
        /**
         * @example [
         *   "01849783-6a26-7147-ab32-71804ca47e8e",
         *   "01849782-1017-7389-8de4-c97c587fd7e3"
         * ]
         */
        'application/json': string[];
      };
    };
  };
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export interface operations {
  /**
   * Shops
   * @description Return information about shops
   */
  'service-shops-v1': {
    parameters: {
      query?: {
        country?: components['parameters']['country'];
      };
    };
    responses: {
      /** @description List of shops and their details */
      200: {
        content: {
          'application/json': components['schemas']['resp.service.shops'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Deals List
   * @description Get current deals. Follows same rules as deals list displayed on the website, which means that
   * you will not get one game more than once in the list.
   *
   * For each game, the best price is displayed, ignoring stores that currently don't have game on sale,
   * even if they currently have a better price.
   */
  'deals-v2': {
    parameters: {
      query?: {
        country?: components['parameters']['country'];
        /** @description Deals list offset */
        offset?: number;
        /** @description How many deals to return */
        limit?: number;
        /** @description Sorting values, same as in deals list on the website */
        sort?: string;
        /** @description Load non-sale prices */
        nondeals?: boolean;
        /** @description Load deals for mature prices */
        mature?: boolean;
        /** @description List of shop IDs separated by comma */
        shops?: number[];
        /** @description Filter string */
        filter?: string;
      };
    };
    responses: {
      /** @description Deals list */
      200: {
        content: {
          'application/json': components['schemas']['resp.deals'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Game Lookup
   * @description Lookup game based on title or Steam appid
   */
  'games-lookup-v1': {
    parameters: {
      query?: {
        /** @description Find game by it's name */
        title?: string;
        /** @description Find game by Steam appid */
        appid?: number;
      };
    };
    responses: {
      /** @description Lookup response with found game */
      200: {
        content: {
          'application/json': components['schemas']['resp.games.lookup'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Game Search
   * @description Search for games by title
   */
  'games-search-v1': {
    parameters: {
      query: {
        /** @description Find games by name */
        title: string;
        /** @description Maximum number of results to return */
        results?: number;
      };
    };
    responses: {
      /** @description Search response */
      200: {
        content: {
          'application/json': components['schemas']['resp.games.search'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Game Info
   * @description Get basic game information
   */
  'games-info-v2': {
    parameters: {
      query: {
        id: components['parameters']['gid'];
      };
    };
    responses: {
      /** @description Info response */
      200: {
        content: {
          'application/json': components['schemas']['resp.games.info'];
        };
      };
      400: components['responses']['error-response'];
      /** @description Game not found */
      404: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Prices
   * @description Get games' prices
   */
  'games-prices-v2': {
    parameters: {
      query?: {
        country?: components['parameters']['country'];
        /** @description Load non-sale prices */
        nondeals?: boolean;
        /** @description Allow vouchers in prices */
        vouchers?: boolean;
        /** @description How many prices to load per each game, 0 or omit for no limit */
        capacity?: number;
        /** @description List of shop IDs for which you want to load prices */
        shops?: components['parameters']['shops'];
      };
    };
    /** @description List of Game IDs for which to load prices */
    requestBody: components['requestBodies']['gids-200'];
    responses: {
      /** @description Info response */
      200: {
        content: {
          'application/json': components['schemas']['resp.games.prices'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * History Low
   * @description Get historically lowest prices
   */
  'games-historylow-v1': {
    parameters: {
      query?: {
        country?: components['parameters']['country'];
      };
    };
    /** @description List of Game IDs for which to load historical lows */
    requestBody: components['requestBodies']['gids-200'];
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.games.historylow'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Store Low
   * @description Get historically lowest prices for individual stores
   */
  'games-storelow-v2': {
    parameters: {
      query?: {
        country?: components['parameters']['country'];
        shops?: components['parameters']['shops'];
      };
    };
    /** @description List of Game IDs for which to load store lows */
    requestBody: components['requestBodies']['gids-200'];
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.games.storelow'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Bundles including Game
   * @description Get all bundles which contain the game
   */
  'games-bundles-v2': {
    parameters: {
      query: {
        id: components['parameters']['gid'];
        country?: components['parameters']['country'];
        /** @description Include expired bundles */
        expired?: boolean;
      };
    };
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.games.bundles'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Price Overview
   * @description Get basic price overview for selected games.
   *
   * For each game current best price will be loaded (optionally, only from selected shops),
   * historical low price (among all covered shops).
   *
   * Furthermore, result will also contain list of currently active bundles,
   * which contain at least one of the queried games.
   */
  'games-overview-v2': {
    parameters: {
      query?: {
        country?: components['parameters']['country'];
        shops?: components['parameters']['shops'];
        /** @description Allow vouchers in prices */
        vouchers?: boolean;
      };
    };
    requestBody: components['requestBodies']['gids-200'];
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.games.overview'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * History log
   * @description Get log of historical prices
   */
  'games-history-v2': {
    parameters: {
      query: {
        id: components['parameters']['gid'];
        country?: components['parameters']['country'];
        shops?: components['parameters']['shops'];
        /**
         * @description Load only price changes after this date.
         * By default, only last 3 months are loaded
         */
        since?: string;
      };
    };
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.games.history'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Games in Waitlist
   * @description Get games in user's Waitlist
   */
  'waitlist-games-v1-get': {
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.waitlist.games'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Add to Waitlist
   * @description Add games to user's Waitlist
   */
  'waitlist-games-v1-put': {
    requestBody: components['requestBodies']['gids'];
    responses: {
      /** @description Successful response */
      204: {
        content: never;
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Delete from Waitlist
   * @description Delete games from user's Waitlist
   */
  'waitlist-games-v1-delete': {
    requestBody: components['requestBodies']['gids'];
    responses: {
      /** @description Successful response */
      204: {
        content: never;
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Games in Collection
   * @description Get games in user's Collection
   */
  'collection-games-v1-get': {
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.collection.games'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Add to Collection
   * @description Add games to user's Collection
   */
  'collection-games-v1-put': {
    requestBody: components['requestBodies']['gids'];
    responses: {
      /** @description Successful response */
      204: {
        content: never;
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Delete from Collection
   * @description Delete games from user's Collection
   */
  'collection-games-v1-delete': {
    requestBody: components['requestBodies']['gids'];
    responses: {
      /** @description Successful response */
      204: {
        content: never;
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Waitlist Stats
   * @description Get Waitlist statistics for a game
   *
   * > Note: stats do not take into consideration users' regions.
   * > If they have set their price limit to be a historical low, stats will be computed
   * > for all users as if they were in the region you specify
   */
  'stats-waitlist-v1': {
    parameters: {
      query: {
        id: components['parameters']['gid'];
        country?: components['parameters']['country'];
        /** @description Price bucket size */
        bucket_price?: number;
        /** @description Cut bucket size */
        bucket_cut?: number;
      };
    };
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.stats.waitlist'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Most Waitlisted
   * @description Get list of most Waitlisted games
   */
  'stats-most-waitlisted-v1': {
    parameters: {
      query?: {
        offset?: number;
        limit?: number;
      };
    };
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.stats.ranked-games'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Most Collected
   * @description Get list of most Collected games
   */
  'stats-most-collected-v1': {
    parameters: {
      query?: {
        offset?: number;
        limit?: number;
      };
    };
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.stats.ranked-games'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Most Popular
   * @description Get list of most popular games. Popularity for each game is computed as Waitlisted count + Collected count.
   */
  'stats-most-popular-v1': {
    parameters: {
      query?: {
        offset?: number;
        limit?: number;
      };
    };
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.stats.ranked-games'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * User Info
   * @description Get user info, currently just a username
   */
  'user-info-v2': {
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.user.info'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Lookup Shop's Game IDs
   * @description Lookup shop's game IDs by IsThereAnyDeal game IDs
   */
  'unstable-idlookup-shop-v2': {
    parameters: {
      path: {
        shopId: number;
      };
    };
    /** @description List of game IDs */
    requestBody?: {
      content: {
        'application/json': string[];
      };
    };
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.unstable.idlookup-shop'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Lookup Game IDs
   * @description Lookup IsThereAnyDeal's game IDs by shop's game IDs
   */
  'unstable-idlookup-itad-v2': {
    parameters: {
      path: {
        shopId: number;
      };
    };
    /** @description List of shop's game IDs */
    requestBody?: {
      content: {
        /**
         * @example [
         *   "app/220"
         * ]
         */
        'application/json': string[];
      };
    };
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.unstable.idlookup-game'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Early Access Games
   * @description Returns list of Steam appids, which are currently considered to be early in early access
   */
  'internal-earlyaccess-v1': {
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': number[];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /** Number of Players Statistics */
  'internal-players-v1': {
    parameters: {
      query: {
        appid: number;
      };
    };
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.internal.players'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /** HowLongToBeat Overview */
  'internal-hltb-v1': {
    parameters: {
      query: {
        appid: number;
      };
    };
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.internal.hltb'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /**
   * Reviews Score
   * @description Returns Metacritic user reviews overview and OpenCritic overview for a given game
   */
  'internal-reviews-v1': {
    parameters: {
      query: {
        appid: number;
      };
    };
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.internal.reviews'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /** Conversion Rates */
  'internal-rates-v1': {
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.internal.rates'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
  /** Current stream of Twitch channel */
  'internal-twitchstream-v1': {
    parameters: {
      query: {
        channel: string;
      };
    };
    responses: {
      /** @description Success response */
      200: {
        content: {
          'application/json': components['schemas']['resp.internal.twitchstream'];
        };
      };
      400: components['responses']['error-response'];
      default: components['responses']['error-response'];
    };
  };
}
