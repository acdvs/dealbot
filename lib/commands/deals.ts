import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { createBasicEmbed } from '../util/helpers';
import { Command } from '../util/types';
import DealsEmbed from '../structures/DealsEmbed';
import ChoicesEmbed from '../structures/ChoicesEmbed';
import Bot from '../structures/Bot';

export default <Command>{
  options: new SlashCommandBuilder()
    .setName('deals')
    .setDescription('Get a list of current deals for a game.')
    .addStringOption((option) =>
      option
        .setName('game')
        .setDescription('Misspellings may return nothing.')
        .setRequired(true)
    ),
  run,
};

async function run(ix: ChatInputCommandInteraction, bot: Bot): Promise<void> {
  await ix.deferReply();

  const game = ix.options.getString('game', true);
  const gameId = await api.getGameId(game);

  if (gameId) {
    ix.editReply(await dealEmbed.createAsMessageOpts());
    const dealsEmbed = new DealsEmbed(ix, bot, game, gameId);
  } else {
    const similarGames = await api.search(game, 5);

    if (similarGames && similarGames.length > 0) {
      const choicesEmbed = new ChoicesEmbed(ix, bot, similarGames);
      ix.editReply(await choicesEmbed.createAsMessageOpts());
    } else {
      ix.editReply(
        createBasicEmbed(
          `No results were found for "${game}". Did you spell it correctly?`
        )
      );
    }
  }
}
