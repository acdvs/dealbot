import { ChatInputCommandInteraction } from 'discord.js';

import { Bot } from '../bot';
import { Embed } from '../lib/embed';
import {
  getSteamReviewText,
  toCurrency,
  toReadableNumber,
  truncateStringList,
} from '../lib/utils';
import { APIMethod } from '@dealbot/api/client';
import { DEFAULT_COUNTRY_CODE } from '@dealbot/db/values';

const FIELD_CHAR_LIMIT = 1024;
const ROW_JOIN_CHARS = '\n';
const INLINE_JOIN_CHARS = ', ';

export class DealsEmbed extends Embed {
  private readonly ix: ChatInputCommandInteraction;
  private readonly gameId: string;
  private readonly dealsOnly: boolean;

  private game: APIMethod<'getGameInfo'>;
  private listings: APIMethod<'getGamePrices'> = [];
  private historicalLow: APIMethod<'getHistoricalLow'>;
  private ignoredSellers: string[] = [];
  private countryCode: string | undefined;

  private hasDeals = false;
  private hasDupedSellers = false;

  constructor(
    ix: ChatInputCommandInteraction,
    gameId: string,
    countryCode: string | undefined,
    dealsOnly = true
  ) {
    super();

    this.ix = ix;
    this.gameId = gameId;
    this.countryCode = countryCode;
    this.dealsOnly = dealsOnly;
  }

  async asyncOptions() {
    await this.loadData();
    await this.populate();

    return {
      embeds: [this],
    };
  }

  private async loadData() {
    this.countryCode ||= await Bot.db.getCountryCode(this.ix.guildId!);
    this.countryCode ??= DEFAULT_COUNTRY_CODE;

    const [game, listings, historicalLow] = await Promise.all([
      Bot.api.getGameInfo(this.gameId),
      Bot.api.getGamePrices(this.gameId, this.countryCode),
      Bot.api.getHistoricalLow(this.gameId, this.countryCode),
    ]);

    const deals = listings.filter(
      (p) => p.cut > 0 || p.price.amount < p.regular.amount
    );

    this.setTitle(gameInfo.title);
    this.setURL(gameInfo.urls.game);
    this.setImage(gameInfo.assets.banner300 || null);

    this.hasDeals = this.dealsOnly && deals.length > 0;
    this.listings = this.hasDeals ? deals : listings;
    this.reviews = gameInfo.reviews;
    this.historicalLow = historicalLow;

    if (this.listings.length > 0) {
      this.ignoredSellers = await Bot.db.getIgnoredSellers(this.ix.guildId!);

      if (this.ignoredSellers.length > 0) {
        this.listings = this.listings.filter(
          (x) => !this.ignoredSellers.includes(x.shop.name)
        );
      }
    }
  }

  private async populate() {
    if (this.listings.length > 0) {
      if (this.dealsOnly && !this.hasDeals) {
        this.setDescription('No deals found. Showing all prices.');
      }

      this.setListings();
    } else {
      this.setDescription('No listings found.');
    }

    this.setHistoricalLow();
    this.setSteamReview();
    this.setCustomFooter();
  }

  private setListings() {
    const truncatedSellers = this.truncateSellers();

    this.addFields({
      name: 'Seller',
      value: truncatedSellers.join(ROW_JOIN_CHARS),
      inline: true,
    });

    const listLength =
      truncatedSellers.length < this.listings.length
        ? truncatedSellers.length - 1
        : this.listings.length;

    if (this.hasDeals) {
      const dealPrices = this.listings.map((x) => {
        const price = toCurrency(
          x.price.amount,
          this.countryCode,
          x.price.currency
        );
        return `${price} (-${x.cut}%)`;
      });

      this.addFields({
        name: 'Deal Price',
        value: dealPrices.slice(0, listLength).join(ROW_JOIN_CHARS),
        inline: true,
      });
    }

    const regPrices = this.listings.map((x) =>
      toCurrency(x.regular.amount, this.countryCode, x.regular.currency)
    );
    const longestPrice = regPrices.reduce(
      (t, x) => (x.length > t.length ? x : t),
      ''
    );

    if (!this.hasDeals || longestPrice.length <= 7) {
      this.addFields({
        name: 'Regular Price',
        value: regPrices.slice(0, listLength).join(ROW_JOIN_CHARS),
        inline: true,
      });
    }
  }

  private setHistoricalLow() {
    if (!this.historicalLow) return;

    const { shop, price, regular, cut } = this.historicalLow;
    const isFree = cut === 100 || price.amount === 0;
    const isCut = cut > 0 || price.amount < regular.amount;

    const formattedPrice = toCurrency(
      price.amount,
      this.countryCode,
      price.currency
    );

    this.addFields({
      name: 'Historical Low',
      value: isFree
        ? `FREE from ${shop.name}`
        : isCut
        ? `${formattedPrice} (-${cut}%) from ${shop.name}`
        : `${formattedPrice} from ${shop.name}`,
    });
  }

  private setSteamReview() {
    if (!this.reviews) return;

    const { score, count } =
      this.reviews?.find((x) => x.source === 'Steam') || {};

    if (score && count) {
      const text = getSteamReviewText(score, count);
      const formattedCount = toReadableNumber(count);

      this.addFields({
        name: 'Steam User Review',
        value: `${text} (${score}% from ${formattedCount} users)`,
      });
    }
  }

  private setCustomFooter() {
    let lines = [];
    let configText = `Country: ${this.countryCode}`;

    if (this.ignoredSellers.length > 0) {
      configText = `Hidden sellers: ${this.ignoredSellers.length} | ${configText}`;
    }

    lines.push(configText);

    if (this.hasDupedSellers) {
      lines.push(
        'Some sellers shown have multiple DRM listings. View on IsThereAnyDeal to see the full list.'
      );
    }

    this.setFooter({ text: lines.join('\n\n') });
  }

  private truncateSellers() {
    const dedupedSellers = this.listings.filter(
      (x, i, a) => a.find((y) => y.shop.name === x.shop.name)?.url === x.url
    );

    if (dedupedSellers.length < this.listings.length) {
      this.hasDupedSellers = true;
      this.listings = dedupedSellers;
    }

    const links = this.listings.map((x) => `[${x.shop.name}](${x.url})`);
    const totalLength = links.join(ROW_JOIN_CHARS).length;

    if (totalLength > FIELD_CHAR_LIMIT) {
      return truncateStringList(
        links,
        INLINE_JOIN_CHARS,
        FIELD_CHAR_LIMIT,
        this.getListingOverflowText(100).length,
        this.getListingOverflowText
      );
    }

    return links;
  }

  private getListingOverflowText(remaining: number) {
    return `[...and ${remaining} more deals](${this.link})`;
  }
}
