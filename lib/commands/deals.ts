import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

import {
  BasicEmbed,
  Bot,
  ChoicesEmbed,
  Command,
  DealsEmbed,
} from '@/structures';
import api from '@/util/api';

export default <Command>{
  options: new SlashCommandBuilder()
    .setName('deals')
    .setDescription('Get a list of current deals for a game.')
    .addStringOption((option) =>
      option
        .setName('game')
        .setDescription('Game name. Misspellings may return nothing.')
        .setAutocomplete(true)
        .setRequired(true)
    ),
  run,
  autocomplete,
};

async function run(ix: ChatInputCommandInteraction, bot: Bot) {
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

async function autocomplete(ix: AutocompleteInteraction) {
  const inputValue = ix.options.getFocused();

  let suggestions: ApplicationCommandOptionChoiceData[] = [];

  if (inputValue.length > 1) {
    const results = await api.search(inputValue, 25);
    suggestions =
      results?.map((x) => ({ name: x.title, value: x.title })) || [];
  }

  await ix.respond(suggestions);
}
