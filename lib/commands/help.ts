import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import axios from 'axios';

import { BasicEmbed, Bot, Command } from '@/structures';
import { toMonthName } from '@/util/formatters';

const API_ERROR_RECENCY_WINDOW_MIN = process.env
  .API_ERROR_RECENCY_WINDOW_MIN as string;

export default <Command>{
  options: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Forgot the commands again?'),
  run,
};

async function run(interaction: ChatInputCommandInteraction, bot: Bot) {
  const serverCount = interaction.client.guilds.cache.size;
  const s = serverCount !== 1 ? 's' : '';

  const fields = [
    {
      name: 'Found a bug?',
      value:
        '[Create an issue](https://github.com/acdvs/dealbot/issues/new/choose) on GitHub and include as much detail as possible.',
    },
  ];

  try {
    const hasRecentAPIError = await bot.db.hasRecentAPIError();

    fields.unshift({
      name: 'IsThereAnyDeal API Status',
      value: hasRecentAPIError
        ? `⚠️ Errored within the last ${API_ERROR_RECENCY_WINDOW_MIN} minutes`
        : '✅ Good',
    });
  } catch {}

  try {
    const latestReleaseRes = await axios.get(
      'https://api.github.com/repos/acdvs/dealbot/releases/latest'
    );
    const { html_url, tag_name, published_at, body } = latestReleaseRes.data;

    const publishedAt = new Date(published_at);
    const publishedMonth = toMonthName(publishedAt.getMonth());
    const publishedAtFormatted = `${publishedAt.getDate()} ${publishedMonth} ${publishedAt.getFullYear()}`;

    let bodyFormatted = body.replace(/(\n|\r)+/g, '\n');
    bodyFormatted = bodyFormatted.replace(
      /#+\s?(New Features|Changes)\n+/gi,
      ''
    );

    fields.push({
      name: 'Latest Release',
      value: `${tag_name} on ${publishedAtFormatted} ([Release Notes](${html_url}))\n${bodyFormatted}`,
    });
  } catch {}

  const embed = new BasicEmbed({
    description: [
      'If you find the bot useful, consider helping with monthly server costs.',
      'Donate via [GitHub](https://github.com/acdvs/dealbot) or [Patreon](https://www.patreon.com/acdvs). Any amount helps!',
    ].join('\n'),
    fields: fields,
    footer: {
      text: `Currently in ${serverCount} server${s}`,
    },
  });

  interaction.reply({ embeds: [embed], ephemeral: true });
}
