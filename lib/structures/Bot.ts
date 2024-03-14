import {
  ChatInputCommandInteraction,
  Client,
  Events,
  Guild,
  GuildMember,
  Interaction,
} from 'discord.js';

import { CommandManager, Database } from './';
import log from '@/util/logger';

export default class Bot extends Client {
  public db = new Database(this);

  #commands = new CommandManager(this);

  async start(token: string): Promise<void> {
    try {
      log.msg('Logging in...');
      this.login(token);
    } catch (err) {
      log.error('Unable to login!');
    }

    this.on(Events.ClientReady, this.#onReady);
    this.on(Events.InteractionCreate, this.#onInteractionCreate);
    this.on(Events.GuildCreate, this.#onGuildCreate);
    this.on(Events.GuildDelete, this.#onGuildDelete);

    process.on('exit', () => {
      this.destroy();
    });
  }

  async #onReady(): Promise<void> {
    if (!this.user) {
      log.error('Client user does not exist');
      process.exit(1);
    }

    log.msg(`Starting ${this.user.username}...`);

    if (!this.application?.owner) {
      await this.application?.fetch();
    }

    await Promise.all([
      this.#commands.load(),
      this.db.updateGuildCount(),
      this.db.insertSellers(),
    ]);

    log.msg(`${this.user.username} successfully started.`);
  }

  #onGuildCreate(guild: Guild) {
    this.db.insertGuild(guild.id);
    this.#commands.pushCommands();
  }

  #onGuildDelete(guild: Guild) {
    this.db.deleteGuild(guild.id);
  }

  #onInteractionCreate(ix: Interaction): void {
    const member = ix.member as GuildMember;

    if (!ix.inGuild() || !member || !('id' in member)) {
      return;
    }

    if (ix.isCommand() && ix instanceof ChatInputCommandInteraction) {
      this.#commands.runCommand(ix);
    }
  }
}
