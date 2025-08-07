import { Client, ClientOptions, Events, Guild, Interaction } from 'discord.js';

import { CommandManager } from './command-manager';
import { log } from './lib/utils';
import { Database } from '@dealbot/db/client';
import APIClient from '@dealbot/api/client';

const isProduction = process.env.NODE_ENV === 'production';

export class Bot extends Client {
  private readonly commandManager = new CommandManager(this);

  static readonly api = new APIClient(process.env.ITAD_API_KEY!);
  static readonly db = new Database(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  constructor(options: ClientOptions) {
    super(options);

    this.on(Events.ClientReady, this.onReady);
    this.on(Events.GuildCreate, this.onGuildCreate);
    this.on(Events.GuildDelete, this.onGuildDelete);
    this.on(Events.InteractionCreate, this.onInteractionCreate);

    process.on('exit', () => this.destroy());
    process.on('SIGINT', () => this.destroy());
  }

  async start(token: string) {
    try {
      log.msg('Logging in');
      await this.login(token);
    } catch {
      log.error('Unable to login');
    }
  }

  private async onReady() {
    log.msg(`Starting ${this.user!.username}`);

    await this.checkGuildCount();
    await this.commandManager.update();

    log.msg(`${this.user!.username} successfully started.`);
  }

  private onGuildCreate(guild: Guild) {
    Bot.db.addGuild(guild.id);
    this.commandManager.update(guild.id);
  }

  private onGuildDelete(guild: Guild) {
    Bot.db.deleteGuild(guild.id);
  }

  private async onInteractionCreate(ix: Interaction) {
    if (ix.isChatInputCommand()) {
      this.commandManager.run(ix);
    } else if (ix.isAutocomplete()) {
      this.commandManager.autocomplete(ix);
    }
  }

  async checkGuildCount() {
    if (!isProduction) {
      return;
    }

    const guilds = this.guilds.cache;
    const storedGuildCount = await Bot.db.getGuildCount();

    if (storedGuildCount && guilds.size > storedGuildCount) {
      console.log('Guild count mismatch. Updating...');

      const cachedGuildIds = guilds.map((guild: Guild) => ({
        id: guild.id,
      }));

      Bot.db.updateGuildCount(cachedGuildIds);
    }
  }
}
