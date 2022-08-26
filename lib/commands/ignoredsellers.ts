import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import Bot from '../structures/Bot';
import Database from '../structures/Database';
import { createBasicEmbed } from '../util/helpers';
import log from '../util/logger';
import { Command, BasicEmbed } from '../util/types';

export default <Command>{
  options: new SlashCommandBuilder()
    .setName('ignoredsellers')
    .setDescription(
      'List all ignored sellers. Ignored sellers do not appear in /deals results.'
    )
    .setDefaultMemberPermissions(0x8)
    .addSubcommand((command) =>
      command
        .setName('list')
        .setDescription('List all ignored sellers for this guild.')
    )
    .addSubcommand((command) =>
      command
        .setName('add')
        .setDescription('Add an ignored seller.')
        .addStringOption((option) =>
          option
            .setName('seller')
            .setDescription(
              'Must be spelled exactly as it appears in the /sellers command.'
            )
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName('remove')
        .setDescription('Remove an ignored seller.')
        .addStringOption((option) =>
          option
            .setName('seller')
            .setDescription(
              'Must be spelled exactly as it appears in the /sellers command.'
            )
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName('clear')
        .setDescription('Clear all previously added ignored sellers.')
    ),
  run,
};

async function run(ix: ChatInputCommandInteraction, bot: Bot) {
  try {
    await ix.deferReply({ ephemeral: true });

    switch (ix.options.getSubcommand()) {
      case 'list':
        listIgnoredSellers(ix, bot.db);
        break;
      case 'add':
        addIgnoredSeller(ix, bot.db);
        break;
      case 'remove':
        removeIgnoredSeller(ix, bot.db);
        break;
      case 'clear':
        clearIgnoredSellers(ix, bot.db);
    }
  } catch (e: any) {
    ix.editReply(createBasicEmbed(e));
    log.error(e);
  }
}

async function listIgnoredSellers(
  ix: ChatInputCommandInteraction,
  db: Database
) {
  const ignoredSellers = await db.getIgnoredSellers(ix.guildId!);

  if (ignoredSellers.length > 0) {
    ix.editReply({
      embeds: [
        new BasicEmbed({
          title: `Ignored sellers (${ignoredSellers.length})`,
          description: ignoredSellers
            .map((x) => x.title)
            .sort()
            .join('\n'),
        }),
      ],
    });
  } else {
    ix.editReply(createBasicEmbed('No ignored sellers have been added yet.'));
  }
}

async function addIgnoredSeller(ix: ChatInputCommandInteraction, db: Database) {
  const seller = ix.options.getString('seller', true);
  const hasIgnoredSeller = await db.hasIgnoredSeller(ix.guildId!, seller);

  if (!hasIgnoredSeller) {
    const ignoredSeller = await db.insertIgnoredSeller(ix.guildId!, seller);

    if (!ignoredSeller) {
      ix.editReply(
        createBasicEmbed(
          'Unable to add ignored seller. Please try again later.'
        )
      );
    } else {
      ix.editReply(
        createBasicEmbed(`Now ignoring **${ignoredSeller.title}**.`)
      );
    }
  } else {
    ix.editReply(createBasicEmbed(`**${seller}** is already ignored.`));
  }
}

async function removeIgnoredSeller(
  ix: ChatInputCommandInteraction,
  db: Database
) {
  const seller = ix.options.getString('seller', true);
  const hasIgnoredSeller = await db.hasIgnoredSeller(ix.guildId!, seller);

  if (hasIgnoredSeller) {
    const count = await db.deleteIgnoredSeller(ix.guildId!, seller);

    if (count === 0) {
      ix.editReply(
        createBasicEmbed(
          'Unable to remove ignored seller. Please try again later.'
        )
      );
    } else {
      ix.editReply(createBasicEmbed(`No longer ignoring **${seller}**.`));
    }
  } else {
    ix.editReply(createBasicEmbed(`**${seller}** is not an ignored seller.`));
  }
}

async function clearIgnoredSellers(
  ix: ChatInputCommandInteraction,
  db: Database
) {
  const ignoredSellers = await db.getIgnoredSellers(ix.guildId!);

  if (ignoredSellers.length > 0) {
    const count = await db.clearIgnoredSellers(ix.guildId!);
    const s = count !== 1 ? 's' : '';

    if (count === 0) {
      ix.editReply(
        createBasicEmbed(
          'Unable to clear ignored sellers. Please try again later.'
        )
      );
    } else {
      ix.editReply(createBasicEmbed(`Cleared ${count} ignored seller${s}.`));
    }
  } else {
    ix.editReply(createBasicEmbed('No sellers are ignored.'));
  }
}
