import {
  ChatInputCommandInteraction,
  Client,
  Guild,
  GuildMember,
  Interaction,
} from 'discord.js';
import CommandManager from './CommandManager';
import Database from './Database';
import log from '../util/logger';

export default class Bot extends Client {
  public db = new Database(this);
  private _commands = new CommandManager(this);

  async start(token: string): Promise<void> {
    try {
      log.msg('Logging in...');
      this.login(token);
    } catch (err) {
      log.error('Unable to login!');
    }

    this.on('ready', this._onReady);
    this.on('interactionCreate', this._onInteractionCreate);
    this.on('guildCreate', this._onGuildCreate);
    this.on('guildDelete', this._onGuildDelete);

    process.on('exit', () => {
      this.destroy();
    });
  }

  private async _onReady(): Promise<void> {
    if (!this.user) {
      log.error('Client user does not exist');
      process.exit(1);
    }

    log.msg(`Starting ${this.user.username}...`);

    if (!this.application?.owner) {
      await this.application?.fetch();
    }

    await Promise.all([
      this._commands.load(),
      this.db.updateGuildCount(),
      this.db.insertSellers(),
    ]);

    log.msg(`${this.user.username} successfully started.`);
  }

  private _onGuildCreate(guild: Guild) {
    this.db.insertGuild(guild.id);
    this._commands.pushCommands();
  }

  private _onGuildDelete(guild: Guild) {
    this.db.deleteGuild(guild.id);
  }

  private _onInteractionCreate(ix: Interaction): void {
    const member = ix.member as GuildMember;

    if (!ix.inGuild() || !member || !('id' in member)) {
      return;
    }

    if (ix.isCommand() && ix instanceof ChatInputCommandInteraction) {
      this._commands.runCommand(ix);
    }
  }
}
