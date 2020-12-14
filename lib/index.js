'use strict';

require('dotenv').config();

const Discord = require('discord.js');
const bot = new Discord.Client();

const commandsUtil = require('./commands');
const settingsUtil = require('./util/settings');

const Commands = {
  HELP: 'help',
  DEALS: 'deals',
  IGNORED_SELLERS: 'ignoredsellers'
};

let settings;

// =========================
// Start bot
// =========================

bot.login(process.env.BOT_TOKEN)
  .then(() => console.log(`${bot.user.username} logged in`))
  .catch(err => console.error(err));

bot.on('ready', async () => {
  console.log(`${bot.user.username} successfully started`);

  bot.user.setPresence({
    activity: {
      type: 'WATCHING',
      name: `for ${Commands.DEALS}`
    }
  });

  try {
    settings = await settingsUtil.load();

    // If mismatch between current and default settings,
    // merge missing defaults into current settings and save.
    if (!keysMatch(settings, settingsUtil.DEFAULT_SETTINGS)) {
      settings = Object.assign({}, settingsUtil.DEFAULT_SETTINGS, settings);
      settingsUtil.save(settings);
    }
  } catch (e) {
    settings = settingsUtil.DEFAULT_SETTINGS;
    console.error(e);
  }
});

// =========================
// On message
// =========================

bot.on('message', (msg) => {
  const [command, options] = msg.content.split(/\s+(.*)/);

  switch (command.substring(settings.prefix)) {
    case Commands.HELP:
      commandsUtil.help(msg, settings.prefix);
      break;
    case Commands.DEALS:
      if (options) commandsUtil.deals(msg, options, settings.ignoredSellers);
      break;
    case Commands.IGNORED_SELLERS:
      commandsUtil.ignoredSellers(msg, options, settings);
      break;
  }
});

// =========================
// Helpers
// =========================

function keysMatch(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (a === b) return true;
  if (a === null || b === null) return false;
  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every(key => !!b[key]);
}