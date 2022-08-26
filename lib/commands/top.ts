import { APIEmbedField, ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import Bot from '../structures/Bot';
import { formatNumberCommas } from '../util/helpers';
import { Command, BasicEmbed, TopChartOption } from '../util/types';

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

async function run(ix: ChatInputCommandInteraction, bot: Bot) {
  const chart = ix.options.getInteger('chart', true);
  const embed = new BasicEmbed();

  if (chart === TopChartOption.WAITLISTED) {
    const list = await bot.api.getWaitlistChart(20);

    embed.setTitle('Top Waitlisted Games');
    embed.addFields(getGameCountFields(list));
  } else if (chart === TopChartOption.COLLECTED) {
    const list = await bot.api.getCollectionChart(20);

    embed.setTitle('Top Collected Games');
    embed.addFields(getGameCountFields(list));
  } else if (chart === TopChartOption.POPULAR) {
    const popularities = await bot.api.getPopularityChart(20);

    embed.setTitle('Top Games By Popularity');
    embed.setDescription(
      [
        'Popularity is computed as normalized count in waitlists',
        'plus normalized count in collections.\n',
        popularities.map((x) => `${x.position}. ${x.title}`).join('\n'),
      ].join('\n')
    );
  }

  ix.reply({ embeds: [embed] });
}

/**
 * Generate list of fields for game counts
 */
function getGameCountFields(list: Record<string, any>[]): APIEmbedField[] {
  return [
    {
      name: 'Game',
      value: list.map((x) => `${x.position}. ${x.title}`).join('\n'),
      inline: true,
    },
    {
      name: 'Count',
      value: list.map((x) => formatNumberCommas(x.count)).join('\n'),
      inline: true,
    },
  ];
}
