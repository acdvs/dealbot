import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

export class Command {
  options: SlashCommandBuilder;
  run: (ix: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (ix: AutocompleteInteraction) => Promise<void>;

  constructor({ options, run, autocomplete }: Command) {
    this.options = options;
    this.run = run;
    this.autocomplete = autocomplete;
  }
}
