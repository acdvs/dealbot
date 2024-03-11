import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

import { Bot, Command } from '@/structures';
import { createBasicEmbed } from '@/util/helpers';
import { BasicEmbed } from '@/util/types';

export default <Command>{
  options: new SlashCommandBuilder()
    .setName('sellers')
    .setDescription('List all sellers.')
    .setDefaultMemberPermissions(0x8),
  run,
};

async function run(ix: ChatInputCommandInteraction, bot: Bot) {
  const sellers = await bot.db.getSellers();

  if (!sellers || sellers.length === 0) {
    ix.reply(createBasicEmbed('No sellers found.'));
    return;
  }

  ix.reply({
    embeds: [
      new BasicEmbed({
        title: 'Sellers (US)',
        description: sellers.map((x) => x.title).join(', '),
      }),
    ],
    ephemeral: true,
  });
}
