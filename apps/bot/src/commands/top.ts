import {
  APIEmbedField,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import { Embed } from '../lib/embed';
import { toReadableNumber } from '../lib/utils';
import {
  getCollectionChart,
  getPopularityChart,
  getWaitlistChart,
} from '@dealbot/api/requests';

type WaitlistChart = Awaited<ReturnType<typeof getWaitlistChart>>;
type CollectionChart = Awaited<ReturnType<typeof getCollectionChart>>;
type PopularityChart = Awaited<ReturnType<typeof getPopularityChart>>;
type TopChart = WaitlistChart | CollectionChart | PopularityChart;

enum TopChartOption {
  WAITLISTED,
  COLLECTED,
  POPULAR,
}

export const options = new SlashCommandBuilder()
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
  );

export async function run(ix: ChatInputCommandInteraction) {
  const chart = ix.options.getInteger('chart', true);
  const embed = new Embed();

  if (chart === TopChartOption.WAITLISTED) {
    const list = await getWaitlistChart();

    if (!list || list.length === 0) {
      ix.reply(Embed.basic('Top waitlisted games unavailable.'));
      return;
    }

    embed.setTitle('Top Waitlisted Games');
    embed.addFields(getGameCountFields<WaitlistChart>(list));
  } else if (chart === TopChartOption.COLLECTED) {
    const list = await getCollectionChart();

    if (!list || list.length === 0) {
      ix.reply(Embed.basic('Top collected games unavailable.'));
      return;
    }

    embed.setTitle('Top Collected Games');
    embed.addFields(getGameCountFields<CollectionChart>(list));
  } else if (chart === TopChartOption.POPULAR) {
    const list = await getPopularityChart();

    if (!list || list.length === 0) {
      ix.reply(Embed.basic('Top popular games unavailable.'));
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
