import {
  APIEmbedField,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import { Bot } from '../bot';
import { Embed } from '../lib/embed';
import { toReadableNumber } from '../lib/utils';
import { APIMethod } from '@dealbot/api/client';

type WaitlistChart = APIMethod<'getWaitlistChart'>;
type CollectionChart = APIMethod<'getCollectionChart'>;
type PopularityChart = APIMethod<'getPopularityChart'>;
type TopChart = WaitlistChart | CollectionChart | PopularityChart;

type TopChartOption = 'waitlisted' | 'collected' | 'popular';

export const options = new SlashCommandBuilder()
  .setName('top')
  .setDescription('Get the top most waitlisted, collected, or popular games.')
  .addStringOption((option) =>
    option
      .setName('chart')
      .setDescription('Chart type')
      .setChoices<{ name: string; value: TopChartOption }>(
        { name: 'waitlisted', value: 'waitlisted' },
        { name: 'collected', value: 'collected' },
        { name: 'popular', value: 'popular' }
      )
      .setRequired(true)
  );

export async function run(ix: ChatInputCommandInteraction) {
  const chart = ix.options.getString('chart', true) as TopChartOption;
  const embed = new Embed();

  if (chart === 'waitlisted') {
    const list = await Bot.api.getWaitlistChart();

    if (!list || list.length === 0) {
      ix.reply(Embed.basic('Top waitlisted games unavailable.'));
      return;
    }

    embed.setTitle('Top Waitlisted Games');
    embed.addFields(getGameCountFields<WaitlistChart>(list));
  } else if (chart === 'collected') {
    const list = await Bot.api.getCollectionChart();

    if (!list || list.length === 0) {
      ix.reply(Embed.basic('Top collected games unavailable.'));
      return;
    }

    embed.setTitle('Top Collected Games');
    embed.addFields(getGameCountFields<CollectionChart>(list));
  } else if (chart === 'popular') {
    const list = await Bot.api.getPopularityChart();

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
