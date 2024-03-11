import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

import { BasicEmbed, Bot, Command } from '@/structures';

export default <Command>{
  options: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Forgot the commands again?'),
  run,
};

async function run(interaction: ChatInputCommandInteraction, bot: Bot) {
  const serverCount = interaction.client.guilds.cache.size;
  const s = serverCount !== 1 ? 's' : '';

  const embed = new BasicEmbed({
    fields: [
      {
        name: 'ITAD API status',
        value: (await bot.db.hasRecentAPIError())
          ? '❌ Possibly down'
          : '✅ Good',
      },
      {
        name: 'Support the project',
        value: [
          'If you find the bot useful, consider helping with monthly server costs.',
          'Donate via [GitHub](https://github.com/acdvs/isthereanydeal-lookup) or [Patreon](https://www.patreon.com/acdvs). Any amount helps!',
        ].join('\n'),
      },
      {
        name: 'Found a bug?',
        value:
          '[Create an issue](https://github.com/acdvs/isthereanydeal-lookup/issues/new/choose) on GitHub and include as much detail as possible.',
      },
    ],
    footer: {
      text: `Currently in ${serverCount} server${s}`,
    },
  });

  interaction.reply({ embeds: [embed], ephemeral: true });
}
