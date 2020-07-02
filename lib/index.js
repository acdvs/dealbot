'use strict';

require('dotenv').config();

const Discord = require('discord.js');
const bot = new Discord.Client();

const commands = require('./commands');
const settingsUtil = require('./util/settings');

const PREFIX = commands.COMMAND_PREFIX;
const C_HELP = 'help';
const C_DEALS = 'deals';
const C_WISHLIST = 'wishlist';
const C_IGNORED_SELLERS = 'ignoredsellers';

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

  switch (command.substring(PREFIX.length)) {
    case C_HELP:
      commands.help(msg);
      break;
    case C_DEALS:
      if (options) await commands.deals(msg, options, settings.ignoredSellers);
      break;
    case C_WISHLIST:
      if (options) await commands.wishlist(msg, options);
      break;
    case C_IGNORED_SELLERS:
      await commands.ignoredSellers(msg, options, settings);
      break;
  }
});