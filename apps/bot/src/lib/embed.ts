import { APIEmbed, EmbedBuilder } from 'discord.js';

export class Embed extends EmbedBuilder {
  static readonly COLOR = 0xfbab0e;

  constructor(options?: APIEmbed) {
    super(options);
    this.setColor(Embed.COLOR);
  }

  static basic(description: string) {
    return new Embed({
      description,
    }).options();
  }

  options() {
    return {
      embeds: [this],
    };
  }
}
