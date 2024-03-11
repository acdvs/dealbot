import { APIEmbedField, ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

import api from '@/util/api';
import { createBasicEmbed } from '@/util/helpers';
import { toReadableNumber } from '@/util/formatters';
import { Command, BasicEmbed } from '@/util/types';

type WaitlistChart = Awaited<ReturnType<(typeof api)['getWaitlistChart']>>;
type CollectionChart = Awaited<ReturnType<(typeof api)['getCollectionChart']>>;
type PopularityChart = Awaited<ReturnType<(typeof api)['getPopularityChart']>>;
type TopChart = WaitlistChart | CollectionChart | PopularityChart;

enum TopChartOption {
  WAITLISTED,
  COLLECTED,
  POPULAR,
}

export default <Command>{
  options: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Get the top most waitlisted, collected, or popular games.')
    .addIntegerOption((option) =>
      option
        .setName('chart')
        .setDescription('Chart type')
        .setChoices(
          { name: 'waitlisted', value: TopChartOption.WAITLISTED },
          { name: 'collected', value: TopChartOption.COLLECTED },
          { name: 'popular', value: TopChartOption.POPULAR }
        )
        .setRequired(true)
    ),
  run,
};

async function run(ix: ChatInputCommandInteraction) {
  const chart = ix.options.getInteger('chart', true);
  const embed = new BasicEmbed();

  if (chart === TopChartOption.WAITLISTED) {
    const list = await api.getWaitlistChart();

    if (!list || list.length === 0) {
      ix.reply(createBasicEmbed('Top waitlisted games unavailable.'));
      return;
    }

    embed.setTitle('Top Waitlisted Games');
    embed.addFields(getGameCountFields<WaitlistChart>(list));
  } else if (chart === TopChartOption.COLLECTED) {
    const list = await api.getCollectionChart();

    if (!list || list.length === 0) {
      ix.reply(createBasicEmbed('Top collected games unavailable.'));
      return;
    }

    embed.setTitle('Top Collected Games');
    embed.addFields(getGameCountFields<CollectionChart>(list));
  } else if (chart === TopChartOption.POPULAR) {
    const list = await api.getPopularityChart();

    if (!list || list.length === 0) {
      ix.reply(createBasicEmbed('Top popular games unavailable.'));
      return;
    }

    embed.setTitle('Top Games By Popularity');
    embed.setDescription(
      [
        'Popularity is computed as normalized count in waitlists',
        'plus normalized count in collections.\n',
        list.map((x) => `${x.position}. ${x.title}`).join('\n'),
      ].join('\n')
    );
  }

  ix.reply({ embeds: [embed] });
}

/**
 * Generate list of fields for game counts
 */
function getGameCountFields<C extends TopChart>(
  list: NonNullable<C>
): APIEmbedField[] {
  return [
    {
      name: 'Game',
      value: list.map((x) => `${x.position}. ${x.title}`).join('\n'),
      inline: true,
    },
    {
      name: 'Count',
      value: list.map((x) => toReadableNumber(x.count)).join('\n'),
      inline: true,
    },
  ];
}
