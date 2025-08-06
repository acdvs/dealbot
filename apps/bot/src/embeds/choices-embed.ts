import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

import { DealsEmbed } from './deals-embed';
import { Embed } from '../lib/embed';
import { getSearchUrl, log } from '../lib/utils';
import { APIMethod } from '@dealbot/api/client';

type SimilarGames = APIMethod<'search'>;

export class ChoicesEmbed extends Embed {
  private static readonly SELECTION_TIME_SEC = 30;

  private readonly games: SimilarGames;
  private countryCode: string | undefined;

  constructor(
    ix: ChatInputCommandInteraction,
    games: SimilarGames,
    countryCode?: string,
    includeAll = false
  ) {
    super();
    this.games = games;
    this.countryCode = countryCode;

    const game = ix.options.getString('game', true);

    if (!ix.channel) {
      ix.editReply(Embed.basic('Unexpected error. Please try again later.'));
      return;
    }

    this.setTitle('Similar Results');
    this.setDescription(
      [
        `An exact match was not found for "${game}".\n`,
        `[Click here](${getSearchUrl(
          game
        )}) to search directly on IsThereAnyDeal`,
        'or select a similar result below.',
      ].join('\n')
    );

    this.createCollector(ix, includeAll);
  }

  options() {
    const selectMenu = this.getSelectMenu();

    return {
      ...super.options(),
      components: selectMenu ? [selectMenu] : [],
    };
  }

  private getSelectMenu() {
    if (this.games) {
      return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`deal_opts_select_${new Date().getTime()}`)
          .setPlaceholder('Nothing selected')
          .addOptions(
            ...this.games.map((v, i) =>
              new StringSelectMenuOptionBuilder()
                .setLabel(v.title)
                .setValue(i.toString())
            )
          )
      );
    }
  }

  private createCollector(
    chatIX: ChatInputCommandInteraction,
    includeAll: boolean
  ) {
    if (!chatIX.channel) return;

    const collector = chatIX.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: (menuIX) => menuIX.user.id === chatIX.user.id,
      max: 1,
      time: ChoicesEmbed.SELECTION_TIME_SEC * 1000,
    });

    collector.on('collect', async (menuIX: StringSelectMenuInteraction) => {
      if (!menuIX.values[0]) return;

      collector.stop();

      const optionIdx = Number(menuIX.values[0]);
      const game = this.games?.[optionIdx];

      if (!game) return;

      try {
        const dealsEmbed = new DealsEmbed(
          chatIX,
          game.id,
          this.countryCode,
          includeAll
        );
        const messageOptions = await dealsEmbed.asyncOptions();
        await chatIX.editReply(messageOptions);
      } catch (err) {
        log.error('[CHOICESEMBED]', err);
      }
    });

    collector.on('end', () => {
      chatIX.deleteReply();
    });
  }
}
