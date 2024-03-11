import { Guild as DGuild, Snowflake } from 'discord.js';
import { PrismaClient } from '@prisma/client';

import Bot from './Bot';
import api from '@/util/api';
import log from '@/util/logger';
import { APIError } from '@/util/api';

class Database {
  #bot: Bot;
  #instance: PrismaClient;

  constructor(bot: Bot) {
    this.#bot = bot;
    this.#instance = new PrismaClient({
      errorFormat: 'pretty',
    });
  }

  /**
   * Guild methods
   */

  async updateGuildCount() {
    const guilds = this.#bot.guilds.cache;
    const storedGuildCount = await this.getGuildCount();

    if (storedGuildCount !== guilds.size) {
      log.msg('Guild count mismatch. Updating...');

      const cachedGuildIds = guilds.map((guild: DGuild) => ({
        id: BigInt(guild.id),
      }));

      try {
        const { count } = await this.#instance.guild.createMany({
          data: cachedGuildIds,
          skipDuplicates: true,
        });

        log.msg('Total guilds created:', count);
      } catch (err) {
        log.error('Unable to update guilds', err);
      }
    }
  }

  async getGuildCount() {
    try {
      return await this.#instance.guild.count();
    } catch (err) {
      log.error('Unable to get guild count', err);
    }
  }

  async insertGuild(guildId: Snowflake) {
    try {
      return await this.#instance.guild.create({
        data: { id: BigInt(guildId) },
      });
    } catch (err) {
      log.error('Unable to insert guild', err);
    }
  }

  async deleteGuild(guildId: Snowflake) {
    try {
      return await this.#instance.guild.delete({
        where: { id: BigInt(guildId) },
      });
    } catch (err) {
      log.error('Unable to remove guild', err);
    }
  }

  /**
   * Seller methods
   */

  async getSellers() {
    try {
      return await this.#instance.seller.findMany();
    } catch (err) {
      log.error('Unable to get sellers', err);
    }
  }

  async insertSellers() {
    try {
      const sellers = await api.getSellers();

      if (!sellers || sellers.length === 0) {
        return;
      }

      const { count } = await this.#instance.seller.createMany({
        data: sellers.map((x) => ({
          id: x.id.toString(),
          title: x.title,
        })),
        skipDuplicates: true,
      });

      return count;
    } catch (err) {
      log.error('Unable to insert sellers', err);
    }
  }

  /**
   * Ignored seller methods
   */

  async getIgnoredSellers(guildId: Snowflake) {
    try {
      const ignoredSellers = await this.#instance.ignoredSeller.findMany({
        where: {
          guild: { id: BigInt(guildId) },
        },
        select: {
          seller: true,
        },
      });

      return ignoredSellers.map((x) => x.seller.title);
    } catch (err) {
      log.error('Unable to get ignored sellers', err);
    }
  }

  async hasIgnoredSeller(guildId: Snowflake, sellerTitle: string) {
    try {
      const ignoredSeller = await this.#instance.ignoredSeller.findFirst({
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
    } catch (err) {
      log.error('Unable to check ignored seller', err);
    }
  }

  async insertIgnoredSeller(guildId: Snowflake, sellerTitle: string) {
    try {
      const seller = await this.#instance.seller.findFirst({
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

      const ignoredSeller = await this.#instance.ignoredSeller.create({
        data: {
          guild: { connect: { id: BigInt(guildId) } },
          seller: { connect: { id: seller.id } },
        },
        select: {
          seller: true,
        },
      });

      return ignoredSeller.seller;
    } catch (err) {
      log.error('Unable to insert ignored seller', err);
    }
  }

  async deleteIgnoredSeller(guildId: Snowflake, sellerTitle: string) {
    try {
      const { count } = await this.#instance.ignoredSeller.deleteMany({
        where: {
          guildId: BigInt(guildId),
          seller: { title: sellerTitle },
        },
      });

      return count;
    } catch (err) {
      log.error('Unable to delete ignored seller', err);
    }
  }

  async clearIgnoredSellers(guildId: Snowflake) {
    try {
      const { count } = await this.#instance.ignoredSeller.deleteMany({
        where: { guildId: BigInt(guildId) },
      });

      return count;
    } catch (err) {
      log.error('Unable to clear ignored sellers', err);
    }
  }

  async insertAPIError(error: APIError) {
    return await this.#instance.aPIError.create({
      data: error.json(),
    });
  }

  async hasRecentAPIError() {
    const mostRecentError = await this.#instance.aPIError.findFirst({
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
