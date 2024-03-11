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

import { Bot, DealsEmbed } from './';
import { createBasicEmbed, getSearchUrl } from '@/util/helpers';
import { BasicEmbed } from '@/util/types';

export default class ChoicesEmbed extends BasicEmbed {
  private _ix: ChatInputCommandInteraction;
  private _bot: Bot;
  private _games: Record<string, any>[];

  constructor(
    ix: ChatInputCommandInteraction,
    bot: Bot,
    games: Record<string, any>[]
  ) {
    super();

    this._ix = ix;
    this._bot = bot;
    this._games = games;

    const game = this._ix.options.getString('game', true);

    if (!this._ix.channel) {
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

    this._createCollector();
  }

  getAsMessageOpts(): BaseMessageOptions {
    return {
      embeds: [this],
      components: [this._getSelectMenu()],
    };
  }

  private _getSelectMenu() {
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`deal_opts_select_${new Date().getTime()}`)
        .setPlaceholder('Nothing selected')
        .addOptions(
          ...this._games.map((v, i) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(v.title)
              .setValue(i.toString())
          )
        )
    );
  }

  private _createCollector() {
    const collector = this._ix.channel!.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: (menuIx) => menuIx.user.id === this._ix.user.id,
      max: 1,
    });

    collector.on('collect', async (menuIx: StringSelectMenuInteraction) => {
      if (menuIx.member !== this._ix.member) {
        return;
      }

      if (!menuIx.values[0]) {
        return;
      }

      collector.stop();

      const { title: game, id: gameId } = this._games[menuIx.values[0]];
      const dealEmbed = new DealsEmbed(this._ix, this._bot, game, gameId);

      this._ix.editReply(await dealEmbed.getAsMessageOpts());
    });
  }
}
