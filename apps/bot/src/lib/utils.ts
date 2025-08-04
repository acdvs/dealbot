import colors, { Color } from 'colors';

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

export function toReadableNumber(num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function toTitleCase(str: string) {
  return str.replace(/\b([A-Za-z])/g, (x) => x.toUpperCase());
}

export function toCurrency(
  amount: number | string,
  locale: Intl.LocalesArgument,
  currency: string
) {
  const val = amount.toLocaleString(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return Number(amount) > 0 ? val : 'FREE';
}

export function truncateStringList(
  list: string[],
  joinChars: string,
  charLimit: number,
  charTotalStart: number,
  getOverflowText: (x: number) => string
) {
  let finalItemCount = list.length;
  let charTotal = charTotalStart;

  for (let i = 0; i < list.length; i++) {
    if (i > 0) {
      charTotal += joinChars.length;
    }

    charTotal += list[i].length;

    if (charTotal > charLimit) {
      finalItemCount = i - 1;
      break;
    }
  }

  const shortenedList = list.slice(0, finalItemCount);

  if (list.length > shortenedList.length) {
    const overflowText = getOverflowText(list.length - shortenedList.length);
    shortenedList.push(overflowText);
  }

  return shortenedList;
}

type LogType = 'log' | 'warn' | 'error';

const logFn =
  (type: LogType, text: string, color: keyof Color) =>
  (...args: Parameters<typeof console.log>) =>
    console[type](`[${colors.bold[color](text)}] ${args[0]}`, ...args.slice(1));

export const log = {
  msg: logFn('log', 'LOG', 'green'),
  warn: logFn('warn', 'WARN', 'yellow'),
  error: logFn('error', 'ERR', 'red'),
};
