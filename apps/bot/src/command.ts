import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

export type CommandDefinition = {
  options: SlashCommandBuilder;
  run: (ix: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (ix: AutocompleteInteraction) => Promise<void>;
};

export class Command {
  readonly options: CommandDefinition['options'];
  readonly run: CommandDefinition['run'];
  readonly autocomplete: CommandDefinition['autocomplete'];

  constructor(options: CommandDefinition) {
    this.options = options.options;
    this.run = options.run;
    this.autocomplete = options.autocomplete;
  }
}
