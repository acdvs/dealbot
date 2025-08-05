import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import { Bot } from '../../bot';
import { ChoicesEmbed } from '../../embeds/choices-embed';
import { DealsEmbed } from '../../embeds/deals-embed';
import { Embed } from '../../lib/embed';
import { countries } from '@dealbot/db/values';

function getListingsCommand({
  name,
  description,
  dealsOnly,
}: {
  name: string;
  description: string;
  dealsOnly: boolean;
}) {
  return {
    options: new SlashCommandBuilder()
      .setName(name)
      .setDescription(description)
      .addStringOption((option) =>
        option
          .setName('game')
          .setDescription('Game name. Misspellings may return nothing.')
          .setAutocomplete(true)
          .setMinLength(2)
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('country')
          .setDescription("Overrides the server's country setting.")
          .setAutocomplete(true)
      ),

    async run(ix: ChatInputCommandInteraction) {
      await ix.deferReply();

      const game = ix.options.getString('game', true);
      const countryCode = ix.options.getString('country') || undefined;
      const validCountryCode =
        countryCode &&
        (countries.find((x) => x.code === countryCode)?.code || 'US');

      const results = await Bot.api.search(game, 10);
      const exactResult = results?.find((x) => x.title === game);

      if (exactResult) {
        const embed = new DealsEmbed(
          ix,
          exactResult.id,
          validCountryCode,
          dealsOnly
        );
        const messageOptions = await embed.asyncOptions();
        ix.editReply(messageOptions);
      } else if (results && results.length > 0) {
        const embed = new ChoicesEmbed(
          ix,
          results,
          validCountryCode,
          dealsOnly
        );
        const messageOptions = await embed.options();
        ix.editReply(messageOptions);
      } else {
        ix.editReply(
          Embed.basic(
            `No results were found for "${game}". Did you spell it correctly?`
          )
        );
      }
    },

    async autocomplete(ix: AutocompleteInteraction) {
      const focusedOption = ix.options.getFocused(true);

      if (focusedOption.name === 'game' && focusedOption.value.length > 1) {
        const results = await Bot.api.search(focusedOption.value, 25);
        const suggestions =
          results?.map((x) => ({ name: x.title, value: x.title })) || [];

        await ix.respond(suggestions);
        return;
      }

      if (focusedOption.name === 'country') {
        const options = countries.map((x) => ({ name: x.name, value: x.code }));
        const suggestions = options
          .filter((x) =>
            x.name.toLowerCase().includes(focusedOption.value.toLowerCase())
          )
          .slice(0, 25);

        await ix.respond(suggestions);
      }
    },
  };
}

export default getListingsCommand;
