import { Client, ClientOptions, Events, Guild, Interaction } from 'discord.js';

import { CommandManager } from './command-manager';
import { log } from './lib/utils';
import APIClient from '@dealbot/api/client';
import { Database } from '@dealbot/db/client';

const isProduction = process.env.NODE_ENV === 'production';

export class Bot extends Client {
  private readonly commandManager = new CommandManager();

  static readonly api = new APIClient(process.env.ITAD_API_KEY!);
  static readonly db = new Database(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  constructor(options: ClientOptions) {
    super(options);

    this.once(Events.ClientReady, this.onReady);
    this.on(Events.GuildCreate, this.onGuildCreate);
    this.on(Events.GuildDelete, this.onGuildDelete);
    this.on(Events.InteractionCreate, this.onInteractionCreate);

    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) =>
      process.on(signal, () => process.exit())
    );
    process.on('exit', () => this.destroy());
  }

  async start(token: string) {
    try {
      log.msg('Logging in');
      await this.login(token);
    } catch {
      log.error('Unable to login');
    }
  }

  private async onReady(client: Client<true>) {
    log.msg(`Starting ${client.user.username.toUpperCase()}`);

    await this.checkGuildCount();
    await this.commandManager.update(client.application.id);

    log.msg(`Successfully started ${client.user.username.toUpperCase()}`);
  }

  private onGuildCreate(guild: Guild) {
    Bot.db.addGuild(guild.id);
    this.commandManager.add(guild.client.application.id, guild.id);
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

  private async checkGuildCount() {
    if (!isProduction) return;

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
