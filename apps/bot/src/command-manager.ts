import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Collection,
  DiscordAPIError,
  REST,
  SlashCommandBuilder,
  Snowflake,
} from 'discord.js';
import { API } from '@discordjs/core';

import { Bot } from './bot';
import { Embed } from './lib/embed';
import { CommandError } from './lib/command-error';
import { log } from './lib/utils';
import { APIError } from '@dealbot/api/error';

const API_VERSION = '10';
const COMMAND_TIMEOUT_SEC = 5;

const commandsPath = path.resolve(__dirname, './commands');
const isProduction = process.env.NODE_ENV === 'production';

const rest = new REST({ version: API_VERSION }).setToken(
  process.env.DISCORD_BOT_TOKEN!
);
const api = new API(rest);

type Command = {
  options: SlashCommandBuilder;
  run: (ix: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (ix: AutocompleteInteraction) => Promise<void>;
};

export class CommandManager {
  private readonly bot: Bot;
  private readonly commands: Collection<string, Command>;

  constructor(bot: Bot) {
    this.bot = bot;
    this.commands = new Collection();
  }

  static async load(): Promise<Command[]> {
    const files = await fs.readdir(commandsPath);
    const commandImports = files
      .filter((x) => x.endsWith('.ts'))
      .map((x) => {
        const filepath = path.join(commandsPath, x);
        return import(filepath);
      });

    return await Promise.all(commandImports);
  }

  async set() {
    log.msg('Loading commands');

    const commands = await CommandManager.load();

    for (const command of commands) {
      this.commands.set(command.options.name, command);
      console.log('%s\x1b[32m%s\x1b[0m', '  | ', `/${command.options.name}`);

      for (const subcommand of command.options.options) {
        console.log('%s\x1b[32m%s\x1b[0m', '  |   ', subcommand.toJSON().name);
      }
    }
  }

  async update(guildId?: Snowflake) {
    log.msg('Updating commands');

    const payload = this.commands.map((x) => x.options.toJSON());

    if (isProduction) {
      if (guildId) {
        api.applicationCommands.bulkOverwriteGuildCommands(
          this.bot.application!.id,
          guildId,
          payload
        );
      } else {
        api.applicationCommands.bulkOverwriteGlobalCommands(
          this.bot.application!.id,
          payload
        );
      }
    } else {
      api.applicationCommands.bulkOverwriteGuildCommands(
        this.bot.application!.id,
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
        error.details
      );
      return;
    }

    embed.setDescription('Something went wrong. Please try again later.');
    ix.editReply(embed.options());

    log.error('[UNKNOWN]', JSON.stringify(error, null, 2));
  }
}
