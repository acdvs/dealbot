import {
  ButtonStyle,
  ChatInputCommandInteraction,
  ContainerBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SeparatorBuilder,
  SlashCommandBuilder,
} from 'discord.js';

import { Bot } from '../bot';
import { Command } from '../command';
import { Embed } from '../lib/embed';
import { countries } from '@dealbot/db/values';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

const command = new Command({
  options: new SlashCommandBuilder()
    .setName('settings')
    .setDescription("View your server's settings.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  run: async (ix: ChatInputCommandInteraction) => {
    await ix.deferReply({ flags: MessageFlags.Ephemeral });

    const [countryCode, ignoredSellers] = await Promise.all([
      Bot.db.getCountryCode(ix.guildId!),
      Bot.db.getIgnoredSellers(ix.guildId!),
    ]);

    if (!countryCode || !ignoredSellers) {
      throw 'Database returned null data';
    }

    const country = countries.find((x) => x.code === countryCode);
    const ignoredList =
      ignoredSellers.length > 0 ? ignoredSellers.join(', ') : 'None';

    const container = new ContainerBuilder()
      .setAccentColor(Embed.COLOR)
      .addSectionComponents((section) =>
        section
          .addTextDisplayComponents((text) => text.setContent('## Settings'))
          .setButtonAccessory((btn) =>
            btn
              .setLabel('Server Dashboard')
              .setStyle(ButtonStyle.Link)
              .setURL(`${BASE_URL}/dashboard/${ix.guildId}`)
          )
      )
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents((text) =>
        text.setContent(
          [
            `**Country**\n${country?.name}`,
            `**Ignored sellers**\n${ignoredList}`,
          ].join('\n\n')
        )
      );

    ix.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
});

export default command;
