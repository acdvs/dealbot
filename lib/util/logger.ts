import colors from 'colors';

export default {
  msg: (str: string) => console.log(`[${colors.bold.green('LOG')}] ${str}`),
  warn: (str: string) => console.log(`[${colors.bold.yellow('WARN')}] ${str}`),
  error: (str: string) => console.log(`[${colors.bold.red('ERR')}] ${str}`),
};
