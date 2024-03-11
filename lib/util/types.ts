import { APIEmbed, ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';

import Bot from '@/structures/Bot';

export interface Command {
  options: SlashCommandBuilder;
  run: (interaction: ChatInputCommandInteraction, bot?: Bot) => Promise<void>;
}

export class BasicEmbed extends EmbedBuilder {
  color = 0xfbab0e;

  constructor(options?: APIEmbed) {
    super(options);
    this.setColor(this.color);
  }
}
