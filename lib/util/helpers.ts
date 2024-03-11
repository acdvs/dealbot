import { InteractionReplyOptions } from 'discord.js';
import { BasicEmbed } from './types';

/**
 * Create a description-only embed prewrapped in a reply object
 */
export function createBasicEmbed(
  message: string,
  ephemeral?: boolean
): InteractionReplyOptions {
  return {
    embeds: [
      new BasicEmbed({
        description: message,
      }),
    ],
    ephemeral,
  };
}

export function getSteamReviewText(score: number, count: number) {
  if (score > 95 && count > 500) return 'Overwhelmingly Positive';
  else if (score > 85 && count > 50) return 'Very Positive';
  else if (score > 80) return 'Positive';
  else if (score > 70) return 'Mostly Positive';
  else if (score > 40) return 'Mixed';
  else if (score > 20) return 'Mostly Negative';
  else if (count < 50) return 'Negative';
  else if (count < 500) return 'Very Negative';
  else return 'Overwhelmingly Negative';
}

export function getSearchUrl(name: string): string {
  return 'https://isthereanydeal.com/search/?q=' + name.replace(/\s/g, '+');
}
