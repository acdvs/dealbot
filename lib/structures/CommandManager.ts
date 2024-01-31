import { promises as fs } from 'fs';
import { resolve, join } from 'path';
import { Collection, ChatInputCommandInteraction } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

import Bot from './Bot';
import { createBasicEmbed } from '@/util/helpers';
import log from '@/util/logger';
import { Command } from '@/util/types';

const API_VERSION = '10';
const COMMANDS_PATH = resolve(__dirname, '..', 'commands');

interface CommandImport {
  default: Command;
}

export default class CommandManager extends Collection<string, Command> {
  private _bot: Bot;

  constructor(bot: Bot) {
    super();
    this._bot = bot;
  }

  async load(): Promise<unknown> {
    const files = await fs.readdir(COMMANDS_PATH);
    const commandImports: Promise<CommandImport>[] = [];

    log.msg('Loading commands...');

    for (const file of files) {
      const commandImport = this._importCommand(file);
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

    return this.pushCommands();
  }

  private async _importCommand(fileName: string): Promise<CommandImport> {
    const filePath = join(COMMANDS_PATH, fileName);
    const commandImport = import(filePath);
    return commandImport;
  }

  private _findCommand(name: string) {
    return this.get(name);
  }

  async pushCommands(): Promise<unknown> {
    log.msg('Pushing commands...');

    const rest = new REST({ version: API_VERSION }).setToken(
      process.env.BOT_TOKEN!
    );
    const restBody = { body: this.map((x) => x.options) };

    if (process.env.NODE_ENV === 'production') {
      return rest.put(
        Routes.applicationCommands(this._bot.application!.id),
        restBody
      );
    } else {
      return rest.put(
        Routes.applicationGuildCommands(
          this._bot.application!.id,
          process.env.DEV_GUILD_ID!
        ),
        restBody
      );
    }
  }

  async runCommand(ix: ChatInputCommandInteraction): Promise<void> {
    const command = this._findCommand(ix.commandName);

    try {
      await command?.run(ix, this._bot);
    } catch (err: any) {
      ix.editReply(createBasicEmbed(err.embedMessage || err));
      this._bot.db.insertAPIError(err);
      log.error('Command run error: ' + JSON.stringify(err));
    }
  }
}
