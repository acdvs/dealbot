import { Client, Events, Guild, GuildMember, Interaction } from 'discord.js';

import { CommandManager, Database } from './';
import api from '@/util/api';
import log from '@/util/logger';

type Sellers = Awaited<ReturnType<(typeof api)['getSellers']>>;

export default class Bot extends Client {
  db = new Database(this);
  sellers: Sellers = [];

  #commands = new CommandManager(this);

  async start(token: string) {
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

  async #onReady() {
    if (!this.user) {
      log.error('Client user does not exist');
      process.exit(1);
    }

    log.msg(`Starting ${this.user.username}...`);

    if (!this.application?.owner) {
      await this.application?.fetch();
    }

    const [sellers] = await Promise.all([
      api.getSellers(),
      this.db.updateGuildCount(),
      this.#commands.load(),
    ]);

    this.sellers = sellers;

    log.msg(`${this.user.username} successfully started.`);
  }

  #onGuildCreate(guild: Guild) {
    this.db.insertGuild(guild.id);
    this.#commands.pushCommands();
  }

  #onGuildDelete(guild: Guild) {
    this.db.deleteGuild(guild.id);
  }

  async #onInteractionCreate(ix: Interaction) {
    const member = ix.member as GuildMember;

    if (!ix.inGuild() || !member || !('id' in member)) {
      return;
    }

    if (ix.isChatInputCommand()) {
      this.#commands.runCommand(ix);
    } else if (ix.isAutocomplete()) {
      this.#commands.autocomplete(ix);
    }
  }
}
