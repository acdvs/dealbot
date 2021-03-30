'use strict';

const Discord = require('discord.js');
const { PREFIX, DEFAULT_COOLDOWN, BASE_EMBED_PROPS } = require('../util/config');
const authorHasPerms = require('../util/authorHasPerms');

const GABEN_IMAGE_URL = 'https://cdn.discordapp.com/avatars/722942824999288924/399dcee64a83fd018dafda7d95c7a277.png';

module.exports = {
  name: 'help',
  usages: [{
    args: false,
    description: 'Forgot the commands again?'
  }],
  cooldown: DEFAULT_COOLDOWN,
  run: (msg, options) => getHelp(msg, options)
};

/**
 * List all commands
 * @param {Discord.Message} msg
 * @param {string} options Message options
 */
function getHelp(msg, options) {
  if (options) return;

  const { commands } = msg.client;
  const serverCount = msg.client.guilds.cache.size;
  const s = serverCount !== 1 ? 's' : '';

  const fields = getFields(commands, msg);

  const embed = new Discord.MessageEmbed({
    ...BASE_EMBED_PROPS,
    title: 'Usage Help',
    description: [
      'If you like the bot, consider helping with monthly server costs.',
      '[Donate via Patreon](https://www.patreon.com/acdvs). Any amount helps!'
    ].join('\n'),
    fields,
    footer: {
      text: `Currently in ${serverCount} server${s}`,
      icon_url: GABEN_IMAGE_URL
    }
  });

  msg.channel.send({ embed });
}

/**
 * Get fields from commands
 * @param {Discord.Collection} commands
 * @param {boolean} adminOnly Filter admin commands?
 * @return {Discord.Collection} Fields
 */
function getFields(commands, msg) {
  return commands
    .reduce(getCommands(msg), [])
    .sort((a, b) => a.name - b.name);
}

/**
 * Get commands from collection
 * @param {Discord.Message} msg
 * @returns {Function} Reducer
 */
function getCommands(msg) {
  return function(commands, command) {
    if (
      authorHasPerms(command, msg) &&
      command.name !== module.exports.name
    ) {
      commands.push(...getUsages(command));
    }

    return commands;
  };
}

/**
 * Get usages from command
 * @param {Object} command
 * @return {Array} Usages
 */
function getUsages(command) {
  return command.usages
    .reduce((usages, usage) => {
      usages.push({
        name: `${PREFIX}${command.name}${usage.args ? ` ${usage.args}` : ''}`,
        value: usage.description
      });
      return usages;
    }, []);
}
