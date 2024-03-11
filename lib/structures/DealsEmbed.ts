import { BaseMessageOptions, ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder } from '@discordjs/builders';

import Bot from './Bot';
import Database from './Database';
import api from '@/util/api';
import { getSteamReviewText, toCurrency, toTitleCase } from '@/util/helpers';
import { BasicEmbed, CommandError, CommandErrorCode } from '@/util/types';

type GameDeals = Awaited<ReturnType<(typeof api)['getGameDeals']>>;
type GameDetails = Awaited<ReturnType<(typeof api)['getGameInfo']>>;
type HistoricalLow = Awaited<ReturnType<(typeof api)['getHistoricalLow']>>;
type IgnoredSellers = Awaited<ReturnType<Database['getIgnoredSellers']>>;

export default class DealsEmbed extends BasicEmbed {
  private static readonly FIELD_CHAR_LIMIT = 1024;
  private static readonly ROW_JOIN_CHARS = '\n';
  private static readonly INLINE_JOIN_CHARS = ', ';

  private _ix: ChatInputCommandInteraction;
  private _bot: Bot;

  private _gameId: string;
  private _itadLink: string;
  private _includeAll: boolean;

  constructor(
    ix: ChatInputCommandInteraction,
    bot: Bot,
    gameId: string,
    includeAll = false
  ) {
    super();

    this._ix = ix;
    this._bot = bot;
    this._gameId = gameId;
    this._itadLink = '';
    this._includeAll = includeAll;
  }

  async get(): Promise<EmbedBuilder> {
    await this._populate();
    return this;
  }

  async getAsMessageOpts(): Promise<BaseMessageOptions> {
    await this._populate();
    return {
      embeds: [this],
      components: [],
    };
  }

  private async _populate() {
    if (!this._ix.guildId) {
      return;
    }

    const ignoredSellers = await this._bot.db.getIgnoredSellers(
      this._ix.guildId
    );

    const [gameDeals, gameDetails, historicalLow] = await Promise.all([
      api.getGamePrices(this._gameId, this._includeAll),
      api.getGameInfo(this._gameId),
      api.getHistoricalLow(this._gameId),
    ]);

    if (!details) {
      throw new CommandError(CommandErrorCode.NO_DATA);
    }

    this.setTitle(gameDetails.title);
    this.setURL(gameDetails.urls.game);

    if (!prices || prices.length === 0) {
      this.setDescription('No deals found.');
      this.setThumbnail(gameDetails.assets.banner145 || null);
      return;
    }

    this._itadLink = gameDetails.urls.game;

    this.setImage(gameDetails.assets.banner300 || null);
    this._setListings(gameDeals);
    this._setHistoricalLow(historicalLow);
    this._setSteamReview(gameDetails);
    this._setIgnoredList(ignoredSellers);
  }

  private _setListings(gameDeals: NonNullable<GameDeals>) {
    const sellers = gameDeals.map((x) => `[${x.shop.name}](${x.url})`);
    const truncatedSellers = this._truncateSellers(sellers);

    const listLength =
      truncatedSellers.length < sellers.length
        ? truncatedSellers.length - 1
        : sellers.length;

    this._setSellerField(truncatedSellers);
    this._setPriceFields(gameDeals, listLength);
  }

  private _setSellerField(list: string[]) {
    this.addFields({
      name: 'Seller',
      value: list.join(DealsEmbed.ROW_JOIN_CHARS),
      inline: true,
    });
  }

  private _setPriceFields(
    gameDeals: NonNullable<GameDeals>,
    listLength: number
  ) {
    const newPrices = gameDeals.map(
      (x) => `${toCurrency(x.price.amount)} (-${x.cut}%)`
    );
    const oldPrices = gameDeals.map((x) => toCurrency(x.regular.amount));

    this.addFields([
      {
        name: 'New Price',
        value: newPrices.slice(0, listLength).join(DealsEmbed.ROW_JOIN_CHARS),
        inline: true,
      },
      {
        name: 'Old Price',
        value: oldPrices.slice(0, listLength).join(DealsEmbed.ROW_JOIN_CHARS),
        inline: true,
      },
    ]);
  }

  private _setHistoricalLow(historicalLow: HistoricalLow) {
    if (!historicalLow) {
      return;
    }

    const free = `FREE from ${historicalLow.shop.name}`;
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
          : 'None',
    });
  }

  private _setSteamReview(gameDetails: NonNullable<GameDetails>) {
    const steamReview = gameDetails.reviews?.find((x) => x.source === 'Steam');

    if (steamReview?.score && steamReview?.count) {
      const text = getSteamReviewText(steamReview.score, steamReview.count);

      this.addFields({
        name: 'Steam User Review',
        value: `${text} (${steamReview.score}% from ${steamReview.count} users)`,
      });
    }
  }

  private _setIgnoredList(ignoredSellers: IgnoredSellers) {
    if (!ignoredSellers || ignoredSellers.length === 0) {
      return;
    }

    const overflowText = (count: number) => `and ${count} more`;

    const ignoredSellerTitles = ignoredSellers.map((x) => x.title);
    const shortenedList = this._truncateList(
      ignoredSellerTitles,
      DealsEmbed.INLINE_JOIN_CHARS,
      40,
      0,
      overflowText
    );

    this.setFooter({
      text: `Ignored sellers: ${shortenedList.join(
        DealsEmbed.INLINE_JOIN_CHARS
      )}`,
    });
  }

  private _truncateSellers(sellers: string[]) {
    if (
      sellers.join(DealsEmbed.ROW_JOIN_CHARS).length >
      DealsEmbed.FIELD_CHAR_LIMIT
    ) {
      const overflowText = (count: number) =>
        `[...and ${count} more deals](${this._itadLink})`;
      const charTotalStart = overflowText(100).length;

      return this._truncateList(
        sellers,
        DealsEmbed.INLINE_JOIN_CHARS,
        DealsEmbed.FIELD_CHAR_LIMIT,
        charTotalStart,
        overflowText
      );
    }

    return sellers;
  }

  private _truncateList(
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
