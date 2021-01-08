'use strict';

const path = require('path');
const DEV = process.env.NODE_ENV !== 'prod';
const envFile = DEV ? '.env.dev' : '.env';

require('dotenv').config({ path: path.resolve(__dirname, `../${envFile}`) });

const Discord = require('discord.js');
const dbUtil = require('./util/db/db');
const commands = require('./commands');

const bot = new Discord.Client();
let gates = {};

// =========================
// Start bot
// =========================

bot.login(process.env.BOT_TOKEN)
  .then(() => {
    console.log(`${bot.user.username} logged in`);
    dbUtil.openDatabase();
  })
  .catch(err => console.error(err));

// =========================
// Events
// =========================

bot.on('ready', () => {
  console.log(`${bot.user.username} successfully started`);

  bot.user.setPresence({
    activity: {
      type: 'WATCHING',
      name: `for ${commands.PREFIX}deals`
    }
  });
});

bot.on('message', (msg) => {
  const [command, options] = msg.content.split(/\s+(.*)/);

  if (!msg.guild || gates[msg.guild.id] || !command.startsWith(commands.PREFIX)) {
    return;
  }

  switch (command.substring(commands.PREFIX.length)) {
    case 'help':
      commands.help(msg, commands.PREFIX);
      break;
    case 'deals':
      if (options) commands.deals(msg, options);
      break;
    case 'ignoredsellers':
      commands.ignoredSellers(msg, options);
      break;
    case 'sellers':
      commands.sellers(msg);
      break;
    case 'top':
      commands.top(msg, options);
      break;
  }

  // Limit command usage
  gates[msg.guild.id] = true;
  setTimeout(() => delete gates[msg.guild.id], commands.LIMIT_SECONDS * 1000);
});

bot.on('guildCreate', (guild) => {
  if (DEV) console.log(`Server joined. COUNT: ${bot.guilds.cache.array().length}`);

  dbUtil.insertServer(guild.id);
});

bot.on('guildDelete', (guild) => {
  if (DEV) console.log(`Server left. COUNT: ${bot.guilds.cache.array().length}`);

  dbUtil.removeServer(guild.id);
});