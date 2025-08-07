import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Collection,
  REST,
  Snowflake,
} from 'discord.js';
import { API } from '@discordjs/core';

import { Bot } from './bot';
import { CommandError } from './command-error';
import { CommandDefinition } from './command';
import commands from './commands';
import { Embed } from './lib/embed';
import { log } from './lib/utils';
import { APIError } from '@dealbot/api/error';

const API_VERSION = '10';
const COMMAND_TIMEOUT_SEC = 5;

const isProduction = process.env.NODE_ENV === 'production';

const rest = new REST({ version: API_VERSION }).setToken(
  process.env.DISCORD_BOT_TOKEN!
);
const api = new API(rest);

export class CommandManager {
  private readonly commands: Collection<string, CommandDefinition> =
    new Collection();

  constructor() {
    log.msg('Loading commands');

    for (const command of commands) {
      this.commands.set(command.options.name, command as CommandDefinition);
      log.msg(`  |  ${command.options.name}`);
    }
  }

  async add(appId: string, guildId: Snowflake) {
    log.msg('Adding guild production commands');

    const payload = this.commands.map((x) => x.options.toJSON());
    await api.applicationCommands.bulkOverwriteGuildCommands(
      appId,
      guildId,
      payload
    );
  }

  async update(appId: string) {
    const payload = this.commands.map((x) => x.options.toJSON());

    if (isProduction) {
      log.msg('Updating global production commands');
      await api.applicationCommands.bulkOverwriteGlobalCommands(appId, payload);
    } else {
      log.msg('Updating development commands');
      await api.applicationCommands.bulkOverwriteGuildCommands(
        appId,
        process.env.DISCORD_DEV_GUILD_ID!,
        payload
      );
    }
  }

  async run(ix: ChatInputCommandInteraction) {
    const command = this.commands.get(ix.commandName);
    let timeout;

    if (!command) return;

    try {
      timeout = setTimeout(() => {
        throw new CommandError('TIMED_OUT', command.options.name);
      }, COMMAND_TIMEOUT_SEC * 1000);

      await command.run(ix);
    } catch (err) {
      this.handleError(ix, err);
    } finally {
      clearTimeout(timeout);
    }
  }

  async autocomplete(ix: AutocompleteInteraction) {
    const command = this.commands.get(ix.commandName);

    if (!command?.autocomplete) return;

    try {
      await command.autocomplete(ix);
    } catch (err) {
      log.error('[AUTOCOMPLETE]', err);
    }
  }

  handleError(ix: ChatInputCommandInteraction, error: unknown) {
    const embed = new Embed({
      title: 'Error',
    });

    if (error instanceof APIError) {
      embed.setDescription(
        'Unable to get info from IsThereAnyDeal. Please try again later.'
      );
      ix.editReply(embed.options());

      Bot.db.insertAPIError(error);
      log.error('[API]', JSON.stringify(error, null, 2));
      return;
    }

    if (error instanceof CommandError) {
      embed.setDescription(error.message);
      ix.editReply(embed.options());

      log.warn(
        '[COMMAND] Command timed out after %d seconds:',
        COMMAND_TIMEOUT_SEC,
        error.cause
      );
      return;
    }

    embed.setDescription('Something went wrong. Please try again later.');
    ix.editReply(embed.options());

    log.error('[UNKNOWN]', JSON.stringify(error, null, 2));
  }
}
