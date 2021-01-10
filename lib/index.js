'use strict';

require('dotenv').config();

const dbUtil = require('./util/db/db');
const commands = require('./commands');
const Discord = require('discord.js');
const bot = new Discord.Client();

let gate = {};

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

  if (!msg.guild || !command.startsWith(commands.PREFIX)) {
    return;
  }

  if (gate[msg.guild.id]) {
    const secondsLeft = ((new Date().getTime() - gate[msg.guild.id]) / 1000).toFixed(1);
    msg.channel.send(`Commands are rate-limited. Try again in ${secondsLeft} seconds.`);

    return;
  }

  const fromOwner = msg.author.id === msg.guild.owner.id;

  switch (command.substring(commands.PREFIX.length)) {
    case 'help':
      commands.help(msg, commands.PREFIX);
      break;
    case 'deals':
      commands.deals(msg, options);
      break;
    case 'top':
      commands.top(msg, options);
      break;
    case 'ignoredsellers':
      if (fromOwner) commands.ignoredSellers(msg, options);
      break;
    case 'sellers':
      if (fromOwner) commands.sellers(msg);
      break;
  }

  // Limit command usage
  gate[msg.guild.id] = new Date().getTime();
  setTimeout(() => delete gate[msg.guild.id], commands.LIMIT_SECONDS * 1000);
});

bot.on('guildCreate', guild => dbUtil.insertServer(guild.id));

bot.on('guildDelete', guild => dbUtil.removeServer(guild.id));