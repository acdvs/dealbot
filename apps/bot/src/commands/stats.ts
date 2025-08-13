import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { Bot } from '../bot';
import { Command } from '../command';
import { Embed } from '../lib/embed';
import { toReadableNumber } from '../lib/utils';

type StatOption = 'waitlisted' | 'collected' | 'popular';

const stats = {
  waitlisted: {
    noData: 'Top waitlisted games unavailable.',
    title: 'Top Waitlisted Games',
  },
  collected: {
    noData: 'Top collected games unavailable.',
    title: 'Top Collected Games',
  },
  popular: {
    noData: 'Top popular games unavailable.',
    title: 'Top Popular Games',
  },
};

const command = new Command({
  options: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Get the most waitlisted, collected, or popular games.')
    .addStringOption((option) =>
      option
        .setName('stat')
        .setDescription('Stat type')
        .setChoices<{ name: StatOption; value: StatOption }>(
          { name: 'waitlisted', value: 'waitlisted' },
          { name: 'collected', value: 'collected' },
          { name: 'popular', value: 'popular' }
        )
        .setRequired(true)
    ) as SlashCommandBuilder,

  run: async (ix: ChatInputCommandInteraction) => {
    await ix.deferReply();

    const statOption = ix.options.getString('stat', true) as StatOption;
    const stat = stats[statOption];

    const list = await getStats(statOption);

    if (!list || list.length === 0) {
      ix.editReply(Embed.basic(`Top ${statOption} games unavailable.`));
      return;
    }

    const embed = new Embed({
      title: stat.title,
      fields: [
        {
          name: 'Game',
          value: list.map((x) => `${x.position}\\. ${x.title}`).join('\n'),
          inline: true,
        },
        {
          name: 'Count',
          value: list.map((x) => `${toReadableNumber(x.count)}`).join('\n'),
          inline: true,
        },
      ],
    });

    if (statOption === 'popular') {
      embed.setDescription(
        [
          'Popularity is computed as normalized count in waitlists',
          'plus normalized count in collections.',
        ].join('\n')
      );
    }

    ix.editReply({ embeds: [embed] });
  },
});

async function getStats(stat: StatOption) {
  switch (stat) {
    case 'waitlisted':
      return await Bot.api.getMostWaitlistedStat(10);
    case 'collected':
      return await Bot.api.getMostCollectedStat(10);
    case 'popular':
      return await Bot.api.getMostPopularStat(10);
  }
}

export default command;
