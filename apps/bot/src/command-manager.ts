import { APIError } from '@dealbot/api/error';
import { API } from '@discordjs/core';
import {
  type AutocompleteInteraction,
  ChatInputCommandInteraction,
  Collection,
  REST,
  type Snowflake,
} from 'discord.js';
import { Bot } from './bot';
import type { Command } from './command';
import commands from './commands';
import { Embed } from './embeds';
import { RunError } from './errors';
import { log } from './lib/utils';

const API_VERSION = '10';
const COMMAND_TIMEOUT_SEC = 3;

const rest = new REST({ version: API_VERSION }).setToken(
  process.env.DISCORD_BOT_TOKEN as string,
);
const api = new API(rest);

export class CommandManager {
  private readonly commands: Collection<string, Command> = new Collection();

  constructor() {
    log.msg('Loading commands');

    for (const command of commands) {
      this.commands.set(command.options.name, command as Command);
      log.msg(` | ${command.options.name}`);
    }
  }

  async updateGuildCommands(appId: string, guildId: Snowflake) {
    log.msg('Updating guild commands');

    try {
      const payload = this.commands.map((x) => x.options.toJSON());
      await api.applicationCommands.bulkOverwriteGuildCommands(
        appId,
        guildId,
        payload,
      );
    } catch (err) {
      log.error(err);
    }
  }

  async updateGlobalCommands(appId: string) {
    log.msg('Updating global commands');

    const payload = this.commands.map((x) => x.options.toJSON());
    await api.applicationCommands.bulkOverwriteGlobalCommands(appId, payload);
  }

  async run(ix: ChatInputCommandInteraction) {
    const command = this.commands.get(ix.commandName);
    let timeout: NodeJS.Timeout | null = null;

    if (!command) return;

    try {
      timeout = setTimeout(() => {
        throw new RunError('TIMEOUT', [...ix.options.data]);
      }, COMMAND_TIMEOUT_SEC * 1000);

      await command.run(ix);
    } catch (err) {
      if (err instanceof RunError) {
        this.handleRunError(ix, err);
      } else if (err instanceof APIError) {
        this.handleAPIError(ix, err);
      } else {
        log.error('[UNKNOWN]', JSON.stringify(err, null, 2));
      }
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }

  async autocomplete(ix: AutocompleteInteraction) {
    const command = this.commands.get(ix.commandName);

    if (!command?.autocomplete) return;

    try {
      await command.autocomplete(ix);
    } catch (err) {
      if (err instanceof APIError) {
        this.handleAPIError(ix, err);
      } else {
        log.error('[AUTOCOMPLETE]', JSON.stringify(err, null, 2));
      }
    }
  }

  private handleRunError(ix: ChatInputCommandInteraction, error: RunError) {
    const embed = new Embed({
      title: 'Error',
      description: 'Something went wrong. Please try again later.',
    });
    ix.reply(embed.options());

    log.error('[RUNTIME]', JSON.stringify(error, null, 2));
  }

  private handleAPIError(
    ix: ChatInputCommandInteraction | AutocompleteInteraction,
    error: APIError,
  ) {
    if (ix instanceof ChatInputCommandInteraction) {
      const embed = new Embed({
        title: 'Error',
        description:
          'Unable to get info from IsThereAnyDeal. Please try again later.',
      });
      ix.reply(embed.options());
    }

    Bot.db.insertAPIError(error);

    log.error('[API]', JSON.stringify(error, null, 2));
  }
}
