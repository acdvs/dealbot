import {
  ActionRowBuilder,
  BaseMessageOptions,
  ChatInputCommandInteraction,
  ComponentType,
  StringSelectMenuInteraction,
} from 'discord.js';
import {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from '@discordjs/builders';

import { DealsEmbed } from './';
import { createBasicEmbed, getSearchUrl } from '@/util/helpers';
import { BasicEmbed } from '@/util/types';
import log from '@/util/logger';
import api, { APIError } from '@/util/api';

type SimilarGames = Awaited<ReturnType<(typeof api)['search']>>;

export default class ChoicesEmbed extends BasicEmbed {
  #ix: ChatInputCommandInteraction;
  #games: NonNullable<SimilarGames>;

  constructor(
    ix: ChatInputCommandInteraction,
    games: NonNullable<SimilarGames>
  ) {
    super();

    this.#ix = ix;
    this.#games = games;

    const game = this.#ix.options.getString('game', true);

    if (!this.#ix.channel) {
      ix.editReply(
        createBasicEmbed('Unexpected error. Please try again later.')
      );
      return;
    }

    this.setTitle('Similar Results');
    this.setDescription(
      [
        `An exact match was not found for "${game}".`,
        `[Click here](${getSearchUrl(game)}) to search directly on ITAD`,
        'or select a similar result below.',
      ].join('\n')
    );

    this.#createCollector();
  }

  getAsMessageOpts(): BaseMessageOptions {
    return {
      embeds: [this],
      components: [this.#getSelectMenu()],
    };
  }

  #getSelectMenu() {
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`deal_opts_select_${new Date().getTime()}`)
        .setPlaceholder('Nothing selected')
        .addOptions(
          ...this.#games.map((v, i) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(v.title)
              .setValue(i.toString())
          )
        )
    );
  }

  #createCollector() {
    const collector = this.#ix.channel!.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: (menuIx) => menuIx.user.id === this.#ix.user.id,
      max: 1,
    });

    collector.on('collect', async (menuIx: StringSelectMenuInteraction) => {
      if (menuIx.member !== this.#ix.member) {
        return;
      }

      if (!menuIx.values[0]) {
        return;
      }

      collector.stop();

      const { title: game, id: gameId } = this.#games[menuIx.values[0]];
      const dealEmbed = new DealsEmbed(this.#ix, game, gameId);

      try {
        this.#ix.editReply(await dealEmbed.getAsMessageOpts());
      } catch (err) {
        log.error('[ChoicesEmbed]', err instanceof APIError ? err.raw : err);
      }
    });
  }
}
