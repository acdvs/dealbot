import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  SelectMenuBuilder,
  SelectMenuInteraction,
  SelectMenuOptionBuilder,
  WebhookEditMessageOptions,
} from 'discord.js';
import DealsEmbed from './DealsEmbed';
import { createBasicEmbed, getSearchUrl } from '../util/helpers';
import { BasicEmbed } from '../util/types';
import Bot from './Bot';

export default class ChoicesEmbed extends EmbedBuilder {
  private _ix: ChatInputCommandInteraction;
  private _bot: Bot;
  private _embed = new BasicEmbed();
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

    this._embed = new BasicEmbed({
      title: 'Similar Results',
      description: [
        `An exact match was not found for "${game}".`,
        `[Click here](${getSearchUrl(game)}) to search directly on ITAD`,
        'or select a similar result below.',
      ].join('\n'),
    });

    this._createCollector();
  }

  create(): EmbedBuilder {
    return this._embed;
  }

  createAsMessageOpts(): WebhookEditMessageOptions {
    return {
      embeds: [this._embed],
      components: [this._getSelectMenu()],
    };
  }

  private _getSelectMenu() {
    return new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId(`deal_opts_select_${new Date().getTime()}`)
        .setPlaceholder('Nothing selected')
        .addOptions(
          ...this._games.map((v, i) =>
            new SelectMenuOptionBuilder()
              .setLabel(v.title)
              .setValue(i.toString())
          )
        )
    );
  }

  private _createCollector() {
    const collector = this._ix.channel!.createMessageComponentCollector({
      componentType: ComponentType.SelectMenu,
      filter: (menuIx) => menuIx.user.id === this._ix.user.id,
      max: 1,
    });

    collector.on('collect', async (menuIx: SelectMenuInteraction) => {
      if (menuIx.member !== this._ix.member) {
        return;
      }

      if (!menuIx.values[0]) {
        return;
      }

      collector.stop();

      const { title: game, plain: gameId } = this._games[menuIx.values[0]];
      const dealEmbed = new DealsEmbed({
        ix: this._ix,
        bot: this._bot,
        game,
        gameId,
      });
      this._ix.editReply(await dealEmbed.createAsMessageOpts());
    });
  }
}
