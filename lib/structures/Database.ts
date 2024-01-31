import { Guild as DGuild, Snowflake } from 'discord.js';
import { APIError, Guild, PrismaClient, Seller } from '@prisma/client';

import Bot from './Bot';
import api from '@/util/api';
import log from '@/util/logger';
import { APIErrorData } from '@/util/types';

class Database {
  private _bot: Bot;
  private _instance: PrismaClient;

  constructor(bot: Bot) {
    this._bot = bot;
    this._instance = new PrismaClient({
      errorFormat: 'pretty',
    });
  }

  /**
   * Guild methods
   */

  async updateGuildCount() {
    const guilds = this._bot.guilds.cache;
    const storedGuildCount = await this.getGuildCount();

    if (storedGuildCount !== guilds.size) {
      log.msg('Guild count mismatch. Updating...');

      const cachedGuildIds = guilds.map((guild: DGuild) => ({
        id: BigInt(guild.id),
      }));

      try {
        const { count } = await this._instance.guild.createMany({
          data: cachedGuildIds,
          skipDuplicates: true,
        });

        log.msg(`Total guilds created: ${count}`);
      } catch (e) {
        log.error('Unable to update guilds: ' + JSON.stringify(e));
      }
    }
  }

  async getGuildCount(): Promise<number | null> {
    try {
      const count = await this._instance.guild.count();
      return count;
    } catch (e) {
      log.error('Unable to get guild count: ' + JSON.stringify(e));
      return null;
    }
  }

  async insertGuild(guildId: Snowflake): Promise<Guild | null> {
    try {
      const guild = await this._instance.guild.create({
        data: { id: BigInt(guildId) },
      });

      return guild;
    } catch (e) {
      log.error('Unable to insert guild: ' + JSON.stringify(e));
      return null;
    }
  }

  async deleteGuild(guildId: Snowflake): Promise<Guild | null> {
    try {
      const guild = await this._instance.guild.delete({
        where: { id: BigInt(guildId) },
      });
      return guild;
    } catch (e) {
      log.error('Unable to remove guild: ' + JSON.stringify(e));
      return null;
    }
  }

  /**
   * Seller methods
   */

  async getSellers(): Promise<Seller[]> {
    try {
      const sellers = await this._instance.seller.findMany();
      return sellers;
    } catch (e) {
      log.error('Unable to get sellers: ' + JSON.stringify(e));
      return [];
    }
  }

  async insertSellers(): Promise<number | null> {
    try {
      const sellersRes = await api.getSellers();
      const { count } = await this._instance.seller.createMany({
        data: sellersRes.map((x) => ({
          id: x.id,
          title: x.title,
        })),
        skipDuplicates: true,
      });

      return count;
    } catch (e) {
      log.error('Unable to insert sellers: ' + JSON.stringify(e));
      return null;
    }
  }

  /**
   * Ignored seller methods
   */

  async getIgnoredSellers(guildId: Snowflake): Promise<Seller[]> {
    const ignoredSellers = await this._instance.ignoredSeller.findMany({
      where: {
        guild: { id: BigInt(guildId) },
      },
      select: {
        seller: true,
      },
    });

    return ignoredSellers.map((x) => x.seller);
  }

  async hasIgnoredSeller(
    guildId: Snowflake,
    sellerTitle: string
  ): Promise<boolean> {
    const ignoredSeller = await this._instance.ignoredSeller.findFirst({
      where: {
        AND: [
          { guild: { id: BigInt(guildId) } },
          {
            seller: {
              title: {
                equals: sellerTitle,
                mode: 'insensitive',
              },
            },
          },
        ],
      },
    });

    return !!ignoredSeller;
  }

  async insertIgnoredSeller(
    guildId: Snowflake,
    sellerTitle: string
  ): Promise<Seller | null> {
    const seller = await this._instance.seller.findFirst({
      where: {
        title: {
          equals: sellerTitle,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    if (!seller) {
      return null;
    }

    const ignoredSeller = await this._instance.ignoredSeller.create({
      data: {
        guild: { connect: { id: BigInt(guildId) } },
        seller: { connect: { id: seller.id } },
      },
      select: {
        seller: true,
      },
    });

    return ignoredSeller.seller;
  }

  async deleteIgnoredSeller(
    guildId: Snowflake,
    sellerTitle: string
  ): Promise<number> {
    const { count } = await this._instance.ignoredSeller.deleteMany({
      where: {
        guildId: BigInt(guildId),
        seller: { title: sellerTitle },
      },
    });

    return count;
  }

  async clearIgnoredSellers(guildId: Snowflake): Promise<number> {
    const { count } = await this._instance.ignoredSeller.deleteMany({
      where: { guildId: BigInt(guildId) },
    });

    return count;
  }

  async insertAPIError(error: APIErrorData): Promise<APIError> {
    return await this._instance.aPIError.create({
      data: error.toJSON(),
    });
  }

  async hasRecentAPIError(): Promise<boolean> {
    const mostRecentError = await this._instance.aPIError.findFirst({
      orderBy: {
        timestamp: 'desc',
      },
    });

    if (!mostRecentError) {
      return false;
    }

    const threeHours = 1000 * 60 * 60 * 3;
    const milliToLastError =
      Date.now() - new Date(mostRecentError.timestamp).getTime();

    return milliToLastError < threeHours;
  }
}

export default Database;
