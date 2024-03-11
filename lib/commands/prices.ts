import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

import { Bot, ChoicesEmbed, DealsEmbed } from '@/structures';
import api from '@/util/api';
import { createBasicEmbed } from '@/util/helpers';
import { Command } from '@/util/types';

export default <Command>{
  options: new SlashCommandBuilder()
    .setName('prices')
    .setDescription(
      'Get a list of current prices for a game (including non-deals).'
    )
    .addStringOption((option) =>
      option
        .setName('game')
        .setDescription('Game name. Misspellings may return nothing.')
        .setRequired(true)
    ),
  run,
};

async function run(ix: ChatInputCommandInteraction, bot: Bot): Promise<void> {
  await ix.deferReply();

  const game = ix.options.getString('game', true);
  const gameId = await api.getGameId(game);

  if (gameId) {
    const dealEmbed = new DealsEmbed(ix, bot, gameId, true);
    ix.editReply(await dealEmbed.getAsMessageOpts());
  } else {
    const similarGames = await api.search(game, 5);

    if (similarGames && similarGames.length > 0) {
      const choicesEmbed = new ChoicesEmbed(ix, similarGames);
      ix.editReply(await choicesEmbed.getAsMessageOpts());
    } else {
      ix.editReply(
        createBasicEmbed(
          `No results were found for "${game}". Did you spell it correctly?`
        )
      );
    }
  }
}
