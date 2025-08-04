import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import axios from 'axios';

import { Bot } from '../bot';
import { Embed } from '../lib/embed';

const ITAD_API_ERROR_RECENCY_WINDOW_MIN =
  process.env.ITAD_API_ERROR_RECENCY_WINDOW_MIN!;

export const options = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Forgot the commands again?');

export async function run(ix: ChatInputCommandInteraction) {
  const serverCount = ix.client.guilds.cache.size;
  const s = serverCount !== 1 ? 's' : '';

  const embed = new Embed({
    description: [
      'If you find the bot useful, consider helping with monthly server costs.',
      'Support via [Patreon](https://patreon.com/acdvs) or [GitHub](https://github.com/sponsors/acdvs). Any amount helps!',
    ].join('\n'),
    fields: [
      {
        name: 'Found a bug?',
        value:
          '[Create an issue](https://github.com/acdvs/dealbot/issues/new/choose) on GitHub and include as much detail as possible.',
      },
    ],
  });

  const hasRecentError = await Bot.db.hasRecentAPIError();

  embed.addFields({
    name: 'IsThereAnyDeal Status',
    value: hasRecentError
      ? `⚠️ Errored within the last ${ITAD_API_ERROR_RECENCY_WINDOW_MIN} minutes`
      : '✅ Good',
  });

  try {
    const latestReleaseRes = await axios.get(
      'https://api.github.com/repos/acdvs/dealbot/releases/latest'
    );
    const { html_url, tag_name, published_at, body } = latestReleaseRes.data;

    const publishedAt = new Date(published_at).toLocaleString('en-GB', {
      month: 'short',
      year: 'numeric',
      day: 'numeric',
    });
    const bodyFormatted = body
      .replace(/(\n|\r)+/g, '\n')
      .replace(/#+\s?(New Features|Changes)\n+/gi, '');

    embed.addFields({
      name: 'Latest Release',
      value: [
        `${tag_name} on ${publishedAt} ([Release Notes](${html_url}))`,
        bodyFormatted,
      ].join('\n'),
    });
  } catch {
    embed.addFields({
      name: 'Latest Release',
      value:
        'Unable to get release info. View on [GitHub](https://github.com/acdvs/dealbot/releases).',
    });
  }

  ix.reply({ ...embed.options(), flags: MessageFlags.Ephemeral });
}
