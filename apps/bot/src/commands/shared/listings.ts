import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';

import { Bot } from '../../bot';
import { Command } from '../../command';
import { ChoicesEmbed } from '../../embeds/choices-embed';
import { DealsEmbed } from '../../embeds/deals-embed';
import { Embed } from '../../lib/embed';
import { DEFAULT_COUNTRY_CODE, countries } from '@dealbot/db/values';

const AC_ID_PREFIX = 'AUTOCOMPLETE';

function getListingsCommand({
  name,
  description,
  dealsOnly,
}: {
  name: string;
  description: string;
  dealsOnly: boolean;
}) {
  return new Command({
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
      ) as SlashCommandBuilder,

    async run(ix: ChatInputCommandInteraction) {
      await ix.deferReply();

      let results: Awaited<ReturnType<typeof Bot.api.search>> = [];
      let exactResult: string | undefined;

      const gameInput = ix.options.getString('game', true);

      if (gameInput.startsWith(AC_ID_PREFIX)) {
        exactResult = gameInput.replace(`${AC_ID_PREFIX}-`, '');
      } else {
        results = await Bot.api.search(gameInput, 10);
        exactResult = results?.find((x) => x.title === gameInput)?.id;
      }

      const countryCodeInput = ix.options.getString('country');
      const country = countries.find((x) => x.code === countryCodeInput);
      const countryCode = country?.code || DEFAULT_COUNTRY_CODE;

      if (exactResult) {
        const embed = new DealsEmbed(ix, exactResult, countryCode, dealsOnly);
        const messageOptions = await embed.asyncOptions();
        ix.editReply(messageOptions);
      } else if (results && results.length > 0) {
        const embed = new ChoicesEmbed(ix, results, countryCode, dealsOnly);
        ix.editReply({
          ...embed.options(),
          flags: [MessageFlags.IsComponentsV2],
        });
      } else {
        ix.editReply(
          Embed.basic(
            `No results were found for "${gameInput}". Did you spell it correctly?`
          )
        );
      }
    },

    async autocomplete(ix: AutocompleteInteraction) {
      const focusedOption = ix.options.getFocused(true);
      const value = focusedOption.value;

      let suggestions: ApplicationCommandOptionChoiceData[] = [];

      if (focusedOption.name === 'game' && value.length > 1) {
        const results = await Bot.api.search(value, 25);
        suggestions = results.map((x) => ({
          name:
            x.title.length > 100 ? x.title.substring(0, 95) + '...' : x.title,
          value: `${AC_ID_PREFIX}-${x.id}`,
        }));
      }

      if (focusedOption.name === 'country') {
        const options = countries.map((x) => ({ name: x.name, value: x.code }));
        suggestions = options
          .filter((x) => x.name.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 25);
      }

      await ix.respond(suggestions);
    },
  });
}

export default getListingsCommand;
