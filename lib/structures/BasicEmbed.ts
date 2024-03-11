import { APIEmbed } from 'discord.js';
import { EmbedBuilder } from '@discordjs/builders';

export default class BasicEmbed extends EmbedBuilder {
  color = 0xfbab0e;

  constructor(options?: APIEmbed) {
    super(options);
    this.setColor(this.color);
  }
}
