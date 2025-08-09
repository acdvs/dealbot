import axios from 'axios';
import {
  ButtonStyle,
  ChatInputCommandInteraction,
  ContainerBuilder,
  MessageFlags,
  SeparatorBuilder,
  SlashCommandBuilder,
} from 'discord.js';

import { Command } from '../command';
import { Embed } from '../lib/embed';

const SERVER_INVITE_LINK = 'https://discord.gg/UBy2yVU7ac';
const PATREON_DONATE_LINK = 'https://patreon.com/acdvs';

const GITHUB_RELEASES_LINK = 'https://github.com/acdvs/dealbot/releases';
const GITHUB_RELEASES_ENDPOINT =
  'https://api.github.com/repos/acdvs/dealbot/releases/latest';
const GITHUB_ISSUE_LINK = 'https://github.com/acdvs/dealbot/issues/new/choose';
const GITHUB_DONATE_LINK = 'https://github.com/sponsors/acdvs';

const command = new Command({
  options: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Forgot the commands again?'),

  run: async (ix: ChatInputCommandInteraction) => {
    const changelog = await getChangelog();

    const container = new ContainerBuilder()
      .setAccentColor(Embed.COLOR)
      .addSectionComponents((section) =>
        section
          .addTextDisplayComponents((text) => text.setContent('# Dealbot'))
          .setButtonAccessory((btn) =>
            btn
              .setLabel('Support Server')
              .setURL(SERVER_INVITE_LINK)
              .setStyle(ButtonStyle.Link)
          )
      )
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents((text) =>
        text.setContent(
          [
            'If you find the bot useful, consider helping with monthly server costs.',
            `Support via [Patreon](${PATREON_DONATE_LINK}) or [GitHub](${GITHUB_DONATE_LINK}). Any amount helps!`,
            '### Found a bug?',
            '- Join the support server via the button above and use the #bugs channel.',
            `- Or [create an issue](${GITHUB_ISSUE_LINK}) on GitHub and include as much detail as possible.`,
          ].join('\n')
        )
      )
      .addSeparatorComponents(new SeparatorBuilder())
      .addSectionComponents((section) =>
        section
          .addTextDisplayComponents((text) =>
            text.setContent(['## Latest update', changelog].join('\n'))
          )
          .setButtonAccessory((btn) =>
            btn
              .setLabel('Full Changelog')
              .setURL(GITHUB_RELEASES_LINK)
              .setStyle(ButtonStyle.Link)
          )
      );

    ix.reply({
      components: [container.toJSON()],
      flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
    });
  },
});

async function getChangelog() {
  try {
    const { data } = await axios.get(GITHUB_RELEASES_ENDPOINT);
    const { tag_name, published_at, body } = data;

    const publishedAt = new Date(published_at).toLocaleString('en-GB', {
      month: 'short',
      year: 'numeric',
      day: '2-digit',
    });
    const bodyFormatted = body.replace(/(\n|\r)+/g, '\n');

    return [`${tag_name} on ${publishedAt}`, bodyFormatted].join('\n');
  } catch {
    return `Unable to get release info. Click the link above to view.`;
  }
}

export default command;
