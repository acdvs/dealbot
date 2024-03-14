import { promises as fs } from 'fs';
import { resolve, join } from 'path';
import { Collection, ChatInputCommandInteraction } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

import { BasicEmbed, Bot, Command } from '.';
import CommandError, { CommandErrorCode } from './CommandError';
import { APIError } from '@/util/api';
import log from '@/util/logger';

const API_VERSION = '10';
const COMMANDS_PATH = resolve(__dirname, '..', 'commands');
const COMMAND_TIMEOUT_SEC = 5;

interface CommandImport {
  default: Command;
}

export default class CommandManager extends Collection<string, Command> {
  #bot: Bot;

  constructor(bot: Bot) {
    super();
    this.#bot = bot;
  }

  async load() {
    const files = await fs.readdir(COMMANDS_PATH);
    const commandImports: Promise<CommandImport>[] = [];

    log.msg('Loading commands...');

    for (const file of files) {
      const commandImport = this.#importCommand(file);
      commandImports.push(commandImport);
    }

    const importedCommands: CommandImport[] = await Promise.all(commandImports);
    const commands: Command[] = importedCommands.map((x) => x.default);

    for (const command of commands) {
      this.set(command.options.name, command);
      console.log('%s\x1b[32m%s\x1b[0m', '  | ', `/${command.options.name}`);

      for (const subcommand of command.options.options) {
        console.log('%s\x1b[32m%s\x1b[0m', '  |   ', subcommand.toJSON().name);
      }
    }

    this.pushCommands();
  }

  async #importCommand(fileName: string): Promise<CommandImport> {
    const filePath = join(COMMANDS_PATH, fileName);
    const commandImport = import(filePath);
    return commandImport;
  }

  #findCommand(name: string) {
    return this.get(name);
  }

  async pushCommands() {
    log.msg('Pushing commands...');

    const rest = new REST({ version: API_VERSION }).setToken(
      process.env.BOT_TOKEN!
    );
    const restBody = { body: this.map((x) => x.options) };

    if (process.env.NODE_ENV === 'production') {
      rest.put(Routes.applicationCommands(this.#bot.application!.id), restBody);
    } else {
      rest.put(
        Routes.applicationGuildCommands(
          this.#bot.application!.id,
          process.env.DEV_GUILD_ID!
        ),
        restBody
      );
    }
  }

  async runCommand(ix: ChatInputCommandInteraction) {
    const command = this.#findCommand(ix.commandName);
    const timeout = setTimeout(() => {
      throw new CommandError(CommandErrorCode.TIMED_OUT, command?.options.name);
    }, COMMAND_TIMEOUT_SEC * 1000);

    try {
      await command?.run(ix, this.#bot);
    } catch (err) {
      if (err instanceof APIError) {
        ix.editReply(err.asEmbed());
        log.error('[API]', err.raw);

        if (err.hasAllData) {
          this.#bot.db.insertAPIError(err);
        }

        return;
      }

      if (err instanceof CommandError) {
        ix.editReply(
          BasicEmbed.asMessageOpts(`${err.message} (Code: ${err.code})`)
        );
        log.warn(
          'Command timed out after %d seconds:',
          COMMAND_TIMEOUT_SEC,
          err.details
        );
      }
    } finally {
      clearTimeout(timeout);
    }
  }
}
