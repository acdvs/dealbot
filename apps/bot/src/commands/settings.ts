import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

import { Bot } from '../bot';
import { Embed } from '../lib/embed';
import { countries } from '@dealbot/db/values';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export const options = new SlashCommandBuilder()
  .setName('settings')
  .setDescription("View your server's settings.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function run(ix: ChatInputCommandInteraction) {
  await ix.deferReply({ flags: MessageFlags.Ephemeral });

  const embed = new Embed({
    title: 'Settings',
    description: `<${BASE_URL}/dashboard/${ix.guildId}>`,
  });

  const [countryCode, ignoredSellers] = await Promise.all([
    Bot.db.getCountryCode(ix.guildId!),
    Bot.db.getIgnoredSellers(ix.guildId!),
  ]);

  if (!countryCode || !ignoredSellers) {
    throw 'Database returned null data';
  }

  const country = countries.find((x) => x.code === countryCode);

  embed.addFields([
    {
      name: 'Ignored Sellers',
      value: ignoredSellers.length > 0 ? ignoredSellers.join(', ') : 'None',
      inline: true,
    },
    {
      name: 'Country',
      value: country!.name,
      inline: true,
    },
  ]);

  ix.editReply(embed.options());
}
