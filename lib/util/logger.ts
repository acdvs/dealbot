import colors from 'colors';

const log = {
  msg: (str: string) => console.log(`[${colors.bold.green('LOG')}] ${str}`),
  warn: (str: string) => console.log(`[${colors.bold.yellow('WARN')}] ${str}`),
  error: (str: string) => console.log(`[${colors.bold.red('ERR')}] ${str}`),
};

export default log;
