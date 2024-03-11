import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

import Bot from './Bot';

export default interface Command {
  options: SlashCommandBuilder;
  run: (interaction: ChatInputCommandInteraction, bot?: Bot) => Promise<void>;
}
