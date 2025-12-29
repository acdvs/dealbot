import type { CommandInteractionOption } from 'discord.js';

export class RunError extends Error {
  static messages = {
    TIMEOUT: 'Command took too long to process.',
  };

  constructor(
    readonly code: keyof typeof RunError.messages,
    readonly options: CommandInteractionOption[],
  ) {
    super();

    this.code = code;
    this.message = RunError.messages[code];
    this.stack = undefined;
  }
}
