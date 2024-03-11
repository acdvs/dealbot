import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

import api from '@/util/api';
import {
  BasicEmbed,
  Bot,
  ChoicesEmbed,
  Command,
  DealsEmbed,
} from '@/structures';

export default <Command>{
  options: new SlashCommandBuilder()
    .setName('deals')
    .setDescription('Get a list of current deals for a game.')
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
    const dealsEmbed = new DealsEmbed(ix, bot, gameId);
    ix.editReply(await dealsEmbed.getAsMessageOpts());
  } else {
    const similarGames = await api.search(game, 5);

    if (similarGames && similarGames.length > 0) {
      const choicesEmbed = new ChoicesEmbed(ix, bot, similarGames);
      ix.editReply(await choicesEmbed.getAsMessageOpts());
    } else {
      ix.editReply(
        BasicEmbed.asMessageOpts(
          `No results were found for "${game}". Did you spell it correctly?`
        )
      );
    }
  }
}
