import { BaseMessageOptions, ChatInputCommandInteraction } from 'discord.js';

import api from '@/util/api';
import { BasicEmbed, Bot, Database } from '.';
import CommandError, { CommandErrorCode } from './CommandError';
import { toCurrency, toReadableNumber } from '@/util/formatters';
import { getSteamReviewText } from '@/util/helpers';

const FIELD_CHAR_LIMIT = 1024;
const ROW_JOIN_CHARS = '\n';
const INLINE_JOIN_CHARS = ', ';

type Prices = Awaited<ReturnType<(typeof api)['getGamePrices']>>;
type Details = Awaited<ReturnType<(typeof api)['getGameInfo']>>;
type HistoricalLow = Awaited<ReturnType<(typeof api)['getHistoricalLow']>>;
type IgnoredSellers = Awaited<ReturnType<Database['getIgnoredSellers']>>;

export default class DealsEmbed extends BasicEmbed {
  #ix: ChatInputCommandInteraction;
  #db: Database;

  #gameId: string;
  #itadLink: string;
  #includeAll: boolean;

  constructor(
    ix: ChatInputCommandInteraction,
    bot: Bot,
    gameId: string,
    includeAll = false
  ) {
    super();

    this.#ix = ix;
    this.#db = bot.db;
    this.#gameId = gameId;
    this.#itadLink = '';
    this.#includeAll = includeAll;
  }

  async getAsMessageOpts(): Promise<BaseMessageOptions> {
    await this.#populate();
    return {
      embeds: [this],
      components: [],
    };
  }

  async #populate() {
    if (!this.#ix.guildId) {
      return;
    }

    const ignoredSellers = await this.#db.getIgnoredSellers(this.#ix.guildId);

    // eslint-disable-next-line prefer-const
    let [details, prices, historicalLow] = await Promise.all([
      api.getGameInfo(this.#gameId),
      api.getGamePrices(this.#gameId),
      api.getHistoricalLow(this.#gameId),
    ]);

    if (!details || !prices) {
      throw new CommandError(CommandErrorCode.NO_DATA);
    }

    this.setTitle(details.title);
    this.setURL(details.urls.game);

    if (ignoredSellers && ignoredSellers.length > 0) {
      prices = prices.filter((p) => !ignoredSellers.includes(p.shop.name));
    }

    if (prices.length === 0) {
      this.setDescription('No sellers found.');
    } else {
      if (!this.#includeAll) {
        const deals = prices.filter((p) => p.cut > 0);

        if (deals.length > 0) {
          this.#setListings(deals);
        } else {
          this.setDescription('No deals found. Showing all prices.');
          this.#setListings(prices);
        }
      } else {
        this.#setListings(prices);
      }
    }

    this.#itadLink = details.urls.game;

    this.setImage(details.assets.banner300 || null);
    this.#setHistoricalLow(historicalLow);
    this.#setSteamReview(details);
    this.#setIgnoredList(ignoredSellers);
  }

  #setListings(prices: NonNullable<Prices>) {
    const sellers = prices.map((x) => `[${x.shop.name}](${x.url})`);
    const truncatedSellers = this.#truncateSellers(sellers);

    const listLength =
      truncatedSellers.length < sellers.length
        ? truncatedSellers.length - 1
        : sellers.length;

    this.#setSellerField(truncatedSellers);
    this.#setPriceFields(prices, listLength);
  }

  #setSellerField(list: string[]) {
    this.addFields({
      name: 'Seller',
      value: list.join(ROW_JOIN_CHARS),
      inline: true,
    });
  }

  #setPriceFields(prices: NonNullable<Prices>, listLength: number) {
    const newPrices = prices.map((x) =>
      x.cut > 0 ? `${toCurrency(x.price.amount)} (-${x.cut}%)` : '--'
    );
    const oldPrices = prices.map((x) => toCurrency(x.regular.amount));

    this.addFields([
      {
        name: 'New Price',
        value: newPrices.slice(0, listLength).join(ROW_JOIN_CHARS),
        inline: true,
      },
      {
        name: 'Old Price',
        value: oldPrices.slice(0, listLength).join(ROW_JOIN_CHARS),
        inline: true,
      },
    ]);
  }

  #setHistoricalLow(historicalLow: HistoricalLow) {
    if (!historicalLow) {
      return;
    }

    const free = `FREE from ${historicalLow.shop.name}`;
    const price = `${toCurrency(historicalLow.price.amount)} from ${
      historicalLow.shop.name
    }`;
    const priceCut = `${toCurrency(historicalLow.price.amount)} (-${
      historicalLow.cut
    }%) from ${historicalLow.shop.name}`;

    this.addFields({
      name: 'Historical Low',
      value:
        historicalLow.cut === 100 || historicalLow.price.amount === 0
          ? free
          : historicalLow.price.amount < historicalLow.regular.amount
          ? priceCut
          : price,
    });
  }

  #setSteamReview(details: NonNullable<Details>) {
    const steamReview = details.reviews?.find((x) => x.source === 'Steam');

    if (steamReview?.score && steamReview?.count) {
      const text = getSteamReviewText(steamReview.score, steamReview.count);

      this.addFields({
        name: 'Steam User Review',
        value: `${text} (${steamReview.score}% from ${toReadableNumber(
          steamReview.count
        )} users)`,
      });
    }
  }

  #setIgnoredList(ignoredSellers: IgnoredSellers) {
    if (!ignoredSellers || ignoredSellers.length === 0) {
      return;
    }

    const overflowText = (count: number) => `and ${count} more`;

    const shortenedList = this.#truncateList(
      ignoredSellers,
      INLINE_JOIN_CHARS,
      40,
      0,
      overflowText
    );

    this.setFooter({
      text: `Ignored sellers: ${shortenedList.join(INLINE_JOIN_CHARS)}`,
    });
  }

  #truncateSellers(sellers: string[]) {
    if (sellers.join(ROW_JOIN_CHARS).length > FIELD_CHAR_LIMIT) {
      const overflowText = (count: number) =>
        `[...and ${count} more deals](${this.#itadLink})`;

      const charTotalStart = overflowText(100).length;

      return this.#truncateList(
        sellers,
        INLINE_JOIN_CHARS,
        FIELD_CHAR_LIMIT,
        charTotalStart,
        overflowText
      );
    }

    return sellers;
  }

  #truncateList(
    list: string[],
    joinChars: string,
    charLimit: number,
    charTotalStart: number,
    overflowText: (x: number) => string
  ) {
    let finalItemCount = list.length;
    let charTotal = charTotalStart;

    for (let i = 0; i < list.length; i++) {
      if (i > 0) {
        charTotal += joinChars.length;
      }

      charTotal += list[i].length;

      if (charTotal > charLimit) {
        finalItemCount = i - 1;
        break;
      }
    }

    const shortenedList = list.slice(0, finalItemCount);

    if (list.length > shortenedList.length) {
      shortenedList.push(overflowText(list.length - shortenedList.length));
    }

    return shortenedList;
  }
}
