import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

import { BasicEmbed, Bot, Command, Database } from '@/structures';
import log from '@/util/logger';

export default <Command>{
  options: new SlashCommandBuilder()
    .setName('ignoredsellers')
    .setDescription(
      'List all ignored sellers. Ignored sellers do not appear in /deals or /prices results.'
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
        .setDescription('Ignore a seller.')
        .addStringOption((option) =>
          option
            .setName('seller')
            .setDescription('See `/sellers` for available options.')
            .setAutocomplete(true)
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName('remove')
        .setDescription('Stop ignoring a seller.')
        .addStringOption((option) =>
          option
            .setName('seller')
            .setDescription('See `/ignoredsellers list` for available options.')
            .setAutocomplete(true)
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName('clear')
        .setDescription('Clear all previously added ignored sellers.')
    ),
  run,
  autocomplete,
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
  } catch (err: any) {
    ix.editReply(BasicEmbed.asMessageOpts(err, true));
    log.error('[ignoredsellers]', err);
  }
}

async function listIgnoredSellers(
  ix: ChatInputCommandInteraction,
  db: Database
) {
  const ignoredSellers = await db.getIgnoredSellers(ix.guildId as string);

  if (!ignoredSellers || ignoredSellers.length === 0) {
    ix.editReply(
      BasicEmbed.asMessageOpts('No ignored sellers have been added yet.')
    );
    return;
  }

  ix.editReply({
    embeds: [
      new BasicEmbed({
        title: `Ignored sellers (${ignoredSellers.length})`,
        description: ignoredSellers.sort().join('\n'),
      }),
    ],
  });
}

async function addIgnoredSeller(ix: ChatInputCommandInteraction, db: Database) {
  const seller = ix.options.getString('seller', true);
  const hasIgnoredSeller = await db.hasIgnoredSeller(
    ix.guildId as string,
    seller
  );

  if (hasIgnoredSeller) {
    ix.editReply(BasicEmbed.asMessageOpts(`**${seller}** is already ignored.`));
    return;
  }

  const ignoredSeller = await db.insertIgnoredSeller(
    ix.guildId as string,
    seller
  );

  if (ignoredSeller) {
    ix.editReply(
      BasicEmbed.asMessageOpts(`Now ignoring **${ignoredSeller.title}**.`)
    );
  } else {
    ix.editReply(
      BasicEmbed.asMessageOpts(
        'Unable to add ignored seller. Please try again later.'
      )
    );
  }
}

async function removeIgnoredSeller(
  ix: ChatInputCommandInteraction,
  db: Database
) {
  const seller = ix.options.getString('seller', true);
  const hasIgnoredSeller = await db.hasIgnoredSeller(
    ix.guildId as string,
    seller
  );

  if (!hasIgnoredSeller) {
    ix.editReply(
      BasicEmbed.asMessageOpts(`**${seller}** is not an ignored seller.`)
    );
    return;
  }

  const count = await db.deleteIgnoredSeller(ix.guildId as string, seller);

  if (count === 0) {
    ix.editReply(
      BasicEmbed.asMessageOpts(
        'Unable to remove ignored seller. Please try again later.'
      )
    );
  } else {
    ix.editReply(BasicEmbed.asMessageOpts(`No longer ignoring **${seller}**.`));
  }
}

async function clearIgnoredSellers(
  ix: ChatInputCommandInteraction,
  db: Database
) {
  const ignoredSellers = await db.getIgnoredSellers(ix.guildId as string);

  if (!ignoredSellers || ignoredSellers.length === 0) {
    ix.editReply(BasicEmbed.asMessageOpts('No sellers are ignored.'));
    return;
  }

  const count = await db.clearIgnoredSellers(ix.guildId as string);
  const s = count !== 1 ? 's' : '';

  if (count === 0) {
    ix.editReply(
      BasicEmbed.asMessageOpts(
        'Unable to clear ignored sellers. Please try again later.'
      )
    );
  } else {
    ix.editReply(
      BasicEmbed.asMessageOpts(`Cleared ${count} ignored seller${s}.`)
    );
  }
}

async function autocomplete(ix: AutocompleteInteraction, bot: Bot) {
  if (!bot.sellers || bot.sellers.length === 0) {
    return;
  }

  const focusedOption = ix.options.getFocused(true);
  let suggestions: ApplicationCommandOptionChoiceData[] = [];

  if (focusedOption.value.length > 2) {
    const ignoredSellers = await bot.db.getIgnoredSellers(ix.guildId as string);

    if (ix.options.getSubcommand() === 'add') {
      const matches = bot.sellers.filter(
        (x) =>
          x.title.toLowerCase().includes(focusedOption.value.toLowerCase()) &&
          !ignoredSellers?.includes(x.title)
      );
      suggestions = matches.map((x) => ({ name: x.title, value: x.title }));
    } else if (ix.options.getSubcommand() === 'remove') {
      const matches =
        ignoredSellers?.filter((x) =>
          x.toLowerCase().includes(focusedOption.value.toLowerCase())
        ) || [];
      suggestions = matches.map((x) => ({ name: x, value: x }));
    }
  }

  await ix.respond(suggestions);
}
