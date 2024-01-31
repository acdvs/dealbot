import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  WebhookEditMessageOptions,
} from 'discord.js';
import { toCurrency, toTitleCase } from '../util/helpers';
import { BasicEmbed, DealsEmbedOptions } from '../util/types';
import Bot from './Bot';

export default class DealsEmbed {
  private static readonly FIELD_CHAR_LIMIT = 1024;
  private static readonly ROW_JOIN_CHARS = '\n';
  private static readonly INLINE_JOIN_CHARS = ', ';

  private _ix: ChatInputCommandInteraction;
  private _bot: Bot;

  private _embed: EmbedBuilder;
  private _game: string;
  private _gameId: string;
  private _listings: Record<string, any>[] = [];

  constructor(
    ix: ChatInputCommandInteraction,
    bot: Bot,
    game: string,
    gameId: string
  ) {
    super();

    this._ix = ix;
    this._bot = bot;
    this._game = game;
    this._gameId = gameId;
  }

  async create(): Promise<EmbedBuilder> {
    await this._populate();
    return this._embed;
  }

  async createAsMessageOpts(): Promise<WebhookEditMessageOptions> {
    const embed = await this.create();
    return {
      embeds: [embed],
      components: [],
    };
  }

  private async _populate(): Promise<void> {
    if (!this._ix.guildId) {
      return;
    }

    const ignoredSellers = await this._bot.db.getIgnoredSellers(
      this._ix.guildId
    );

    const [gameDeals, gameDetails, historicalLow] = await Promise.all([
      this._bot.api.getGameDeals(this._gameId),
      this._bot.api.getGameInfo(this._gameId),
      this._bot.api.getHistoricalLow(this._gameId),
    ]);

    if (!gameDeals || !gameDetails) {
      this._embed.setDescription(
        `Unable to get info from IsThereAnyDeal for ${toTitleCase(
          this._game
        )}. Please try again later.`
      );
      return;
    }

    this._embed.setTitle(gameDetails.title);
    this._embed.setURL(gameDetails.urls.game);

    this._listings = gameDeals.list.filter((x) => x.price_new < x.price_old);

    if (this._listings.length === 0) {
      this._embed.setDescription('No deals found.');
      this._embed.setThumbnail(gameDetails.image);
      return;
    }

    this._embed.setImage(gameDetails.image);

    this._setListings(gameDeals);
    this._setHistoricalLow(historicalLow);
    this._setSteamReview(gameDetails);
    this._setIgnoredList(ignoredSellers);
  }

  private _setListings(gameDeals: Record<string, any>): void {
    const sellers = this._listings.map((x) => `[${x.shop.name}](${x.url})`);
    const truncatedSellers = this._truncateSellers(sellers, gameDeals);

    const listLength =
      truncatedSellers.length < sellers.length
        ? truncatedSellers.length - 1
        : sellers.length;

    this._setSellerField(truncatedSellers);
    this._setPriceFields(listLength);
  }

  private _setSellerField(list: string[]): void {
    this._embed.addFields({
      name: 'Seller',
      value: list.join(DealsEmbed.ROW_JOIN_CHARS),
      inline: true,
    });
  }

  private _setPriceFields(listLength: number): void {
    const newPrices = this._listings.map(
      (x) => `${toCurrency(x.price_new)} (-${x.price_cut}%)`
    );
    const oldPrices = this._listings.map((x) => toCurrency(x.price_old));

    this._embed.addFields([
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

  private _setHistoricalLow(historicalLow: Record<string, any>): void {
    if (historicalLow) {
      const free = `${toCurrency(historicalLow.price)} from ${
        historicalLow.shop.name
      }`;
      const priceCut = `${toCurrency(historicalLow.price)} (-${
        historicalLow.cut
      }%) from ${historicalLow.shop.name}`;

      this._embed.addFields({
        name: 'Historical Low',
        value: historicalLow.price === 0 ? free : priceCut,
      });
    }
  }

  private _setSteamReview(gameDetails: Record<string, any>): void {
    const steamReview = gameDetails.reviews?.steam;

    if (steamReview) {
      this._embed.addFields({
        name: 'Steam User Review',
        value: `${steamReview.text} (${steamReview.perc_positive}% from ${steamReview.total} users)`,
      });
    }
  }

  private _setIgnoredList(ignoredSellers: Record<string, any>[]): void {
    if (ignoredSellers.length > 0) {
      const overflowText = (count: number) => `and ${count} more`;
      const ignoredSellerTitles = ignoredSellers.map((x) => x.title);
      const shortenedList = this._truncateList(
        ignoredSellerTitles,
        DealsEmbed.INLINE_JOIN_CHARS,
        0,
        40,
        overflowText
      );

      this._embed.setFooter({
        text: `Ignored sellers: ${shortenedList.join(
          DealsEmbed.INLINE_JOIN_CHARS
        )}`,
      });
    }
  }

  private _truncateSellers(
    sellers: string[],
    gameDeals: Record<string, any>
  ): string[] {
    if (
      sellers.join(DealsEmbed.ROW_JOIN_CHARS).length >
      DealsEmbed.FIELD_CHAR_LIMIT
    ) {
      const overflowText = (count: number) =>
        `[...and ${count} more deals](${gameDeals.urls.game})`;
      const charTotalStart = overflowText(100).length;

      return this._truncateList(
        sellers,
        DealsEmbed.INLINE_JOIN_CHARS,
        charTotalStart,
        DealsEmbed.FIELD_CHAR_LIMIT,
        overflowText
      );
    }

    return sellers;
  }

  private _truncateList(
    list: string[],
    joinChars: string,
    charTotalStart = 0,
    charLimit: number,
    overflowText: (x: any) => string
  ): string[] {
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

    if (overflowText && list.length > shortenedList.length) {
      shortenedList.push(overflowText(list.length - shortenedList.length));
    }

    return shortenedList;
  }
}
