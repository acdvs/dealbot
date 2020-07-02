'use strict';

require('dotenv').config();

const Discord = require('discord.js');
const bot = new Discord.Client();

const commands = require('./commands');
const settingsUtil = require('./util/settings');

const COMMAND_PREFIX = '!';
const C_HELP = `${COMMAND_PREFIX}help`;
const C_DEALS = `${COMMAND_PREFIX}deals`;
const C_WISHLIST = `${COMMAND_PREFIX}wishlist`;
const C_ADD = `${COMMAND_PREFIX}add`;
const C_REMOVE = `${COMMAND_PREFIX}remove`;

let settings = settingsUtil.DEFAULT_SETTINGS;

// =========================
// Start bot
// =========================

bot.login(process.env.BOT_TOKEN);

bot.on('ready', async () => {
  console.log(bot.user.username + ' successfully started');

  bot.user.setPresence({ activity: { type: 'WATCHING', name: `for ${C_DEALS}` }});

  try {
    settings = await settingsUtil.load();
  } catch (e) {
    console.error(e);
  }
});

// =========================
// On message
// =========================

bot.on('message', async (msg) => {
  const [command, options] = msg.content.split(/\s+(.*)/);

  switch (command) {
    case C_HELP:
      commands.help(msg);
      break;
    case C_DEALS:
      if (options) await commands.getDeals(msg, options, settings.ignoredSellers);
      break;
    case C_WISHLIST:
      if (options) await commands.getWishlist(msg, options);
      break;
  }
});