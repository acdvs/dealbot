import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

import { BasicEmbed, Bot, Command } from '@/structures';

export default <Command>{
  options: new SlashCommandBuilder()
    .setName('sellers')
    .setDescription('List all sellers.')
    .setDefaultMemberPermissions(0x8),
  run,
};

async function run(ix: ChatInputCommandInteraction, bot: Bot) {
  if (!bot.sellers || bot.sellers.length === 0) {
    ix.reply(BasicEmbed.asMessageOpts('No sellers found.'));
    return;
  }

  ix.reply({
    embeds: [
      new BasicEmbed({
        title: 'Sellers (US)',
        description: bot.sellers.map((x) => x.title).join(', '),
      }),
    ],
    ephemeral: true,
  });
}
