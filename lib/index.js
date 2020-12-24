'use strict';

require('dotenv').config();

const Discord = require('discord.js');
const bot = new Discord.Client();

const commandsUtil = require('./commands');
const settingsUtil = require('./util/settings');

const Commands = {
  HELP: 'help',
  DEALS: 'deals',
  IGNORED_SELLERS: 'ignoredsellers',
  SELLERS: 'sellers',
  TOP: 'top'
};
const COMMAND_LIMIT_SEC = 2;

let settings;
let gate = true;

// =========================
// Start bot
// =========================

bot.login(process.env.BOT_TOKEN)
  .then(() => console.log(`${bot.user.username} logged in`))
  .catch(err => console.error(err));

bot.on('ready', async () => {
  console.log(`${bot.user.username} successfully started`);

  try {
    settings = await settingsUtil.load();

    // If mismatch between current and default settings,
    // merge missing defaults into current settings and save.
    if (!keysMatch(settings, settingsUtil.DEFAULT_SETTINGS)) {
      settings = Object.assign({}, settingsUtil.DEFAULT_SETTINGS, settings);
      settingsUtil.save(settings);

      console.log('Updated missing settings');
    }
  } catch (e) {
    settings = settingsUtil.DEFAULT_SETTINGS;
    console.error(e);
  }

  bot.user.setPresence({
    activity: {
      type: 'WATCHING',
      name: `for ${settings.prefix}${Commands.DEALS}`
    }
  });
});

// =========================
// On message
// =========================

bot.on('message', (msg) => {
  const [command, options] = msg.content.split(/\s+(.*)/);

  if (!gate || !command.startsWith(settings.prefix)) {
    return;
  }

  switch (command.substring(settings.prefix.length)) {
    case Commands.HELP:
      commandsUtil.help(msg, settings.prefix);
      break;
    case Commands.DEALS:
      if (options) commandsUtil.deals(msg, options, settings.ignoredSellers);
      break;
    case Commands.IGNORED_SELLERS:
      commandsUtil.ignoredSellers(msg, options, settings);
      break;
    case Commands.SELLERS:
      commandsUtil.sellers(msg);
      break;
    case Commands.TOP:
      commandsUtil.top(msg, options);
      break;
  }

  // Disallow new commands
  gate = false;

  // Allow next command after a delay
  setTimeout(() => {
    gate = true;
  }, COMMAND_LIMIT_SEC * 1000);
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