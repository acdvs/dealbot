import {
  ActionRowBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  ContainerBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
} from 'discord.js';

import { DealsEmbed } from './deals-embed';
import { Embed } from '../lib/embed';
import { getSearchUrl } from '../lib/utils';
import { APIMethod } from '@dealbot/api/client';

type SimilarGames = APIMethod<'search'>;

export class ChoicesEmbed {
  private static readonly SELECTION_TIME_SEC = 30;

  private readonly input: string;
  private readonly games: SimilarGames;
  private countryCode: string | undefined;

  constructor(
    ix: ChatInputCommandInteraction,
    games: SimilarGames,
    countryCode?: string,
    includeAll = false
  ) {
    this.input = ix.options.getString('game', true);
    this.games = games;
    this.countryCode = countryCode;

    this.createCollector(ix, includeAll);
  }

  options() {
    const container = this.getContainer();
    const selectMenu = this.getSelectMenu();

    return {
      components: [container, selectMenu],
      flags: [MessageFlags.IsComponentsV2],
    };
  }

  private getContainer() {
    const searchURL = getSearchUrl(this.input);

    return new ContainerBuilder()
      .setAccentColor(Embed.COLOR)
      .addSectionComponents((section) =>
        section
          .addTextDisplayComponents((text) =>
            text.setContent('### Similar Results')
          )
          .setButtonAccessory((btn) =>
            btn
              .setLabel('IsThereAnyDeal')
              .setURL(searchURL)
              .setStyle(ButtonStyle.Link)
          )
      )
      .addTextDisplayComponents((text) =>
        text.setContent(
          [
            `No match found for **${this.input}**.  `,
            'Select a similar result below or click the button\nto see results on IsThereAnyDeal.',
          ].join('\n')
        )
      );
  }

  private getSelectMenu() {
    const options = this.games
      ? this.games.map((v) => ({ label: v.title, value: v.id }))
      : [];

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`deal_opts_select_${new Date().getTime()}`)
        .setPlaceholder('Select a similar result')
        .addOptions(options)
    );
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

    collector.on('collect', async (menuIX) => {
      const gameId = menuIX.values[0];

      if (!gameId) return;

      const dealsEmbed = new DealsEmbed(
        chatIX,
        gameId,
        this.countryCode,
        includeAll
      );
      const messageOptions = await dealsEmbed.asyncOptions();
      await chatIX.followUp(messageOptions);
    });

    collector.on('end', (c, reason) => {
      if (reason === 'time') {
        chatIX.deleteReply();
      } else {
        chatIX.editReply({
          components: [this.getContainer()],
        });
      }
    });
  }
}
