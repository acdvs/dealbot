import colors, { Color } from 'colors';

const logFn =
  (type: 'log' | 'warn' | 'error', text: string, color: keyof Color) =>
  (...args: Parameters<typeof console.log>) =>
    console[type](`[${colors.bold[color](text)}] ${args[0]}`, ...args.slice(1));

export default {
  msg: logFn('log', 'LOG', 'green'),
  warn: logFn('warn', 'WARN', 'yellow'),
  error: logFn('error', 'ERR', 'red'),
};
