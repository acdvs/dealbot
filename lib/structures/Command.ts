import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

import Bot from './Bot';

export default interface Command {
  options: SlashCommandBuilder;
  run: (ix: ChatInputCommandInteraction, bot?: Bot) => Promise<void>;
  autocomplete?: (ix: AutocompleteInteraction, bot?: Bot) => Promise<void>;
}
