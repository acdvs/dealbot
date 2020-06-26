'use strict';

require('dotenv').config();

const Discord = require('discord.js');
const bot = new Discord.Client();
const commands = require('./commands');

const BOT_TOKEN = process.env.BOT_TOKEN;

const COMMAND_PREFIX = '!';
const C_HELP = `${COMMAND_PREFIX}help`;
const C_DEALS = `${COMMAND_PREFIX}deals`;
const C_WISHLIST = `${COMMAND_PREFIX}wishlist`;
const C_ADD = `${COMMAND_PREFIX}add`;
const C_REMOVE = `${COMMAND_PREFIX}remove`;

// =========================
// Start bot
// =========================

bot.login(BOT_TOKEN);

bot.on('ready', () => {
  console.log(bot.user.username + ' successfully started');

  bot.user.setPresence({ activity: { type: 'WATCHING', name: `for ${C_DEALS}` }});
});

// =========================
// On message
// =========================

bot.on('message', async (msg) => {
  const [command, options] = msg.content.split(/\s+(.*)/);

  switch (command) {
    case C_HELP:
      await commands.help(msg);
      break;
    case C_DEALS:
      await commands.getDeals(msg, options);
      break;
  }
});