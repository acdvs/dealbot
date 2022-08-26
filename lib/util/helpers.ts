import { InteractionReplyOptions } from 'discord.js';
import { BasicEmbed } from './types';

export const REQUIRED_PERMISSIONS = [
  'VIEW_CHANNEL',
  'SEND_MESSAGES',
  'EMBED_LINKS',
];

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

export function formatNumberCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function toTitleCase(str: string): string {
  return str.replace(/\b([A-Za-z])/g, (x) => x.toUpperCase());
}

export function getSearchUrl(name: string): string {
  return 'https://isthereanydeal.com/search/?q=' + name.replace(/\s/g, '+');
}

export function toCurrency(num: number | string): string {
  const _num = typeof num === 'number' ? num.toString() : num;
  const parsedNum = Number.parseFloat(_num);
  const price = parsedNum.toFixed(2);

  return parsedNum > 0 ? `$${price}` : 'FREE';
}

export function sleep(sec: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, sec * 1000);
  });
}
