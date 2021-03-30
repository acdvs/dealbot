'use strict';

const Discord = require('discord.js');
const dbUtil = require('../util/db');
const { DEFAULT_COOLDOWN, BASE_EMBED_PROPS } = require('../util/config');

module.exports = {
  name: 'sellers',
  usages: [{
    args: false,
    description: 'Lists all sellers.'
  }],
  permissions: 'ADMINISTRATOR',
  cooldown: DEFAULT_COOLDOWN,
  run: (msg, options) => getSellers(msg, options)
};

/**
 * Get all sellers
 * @param {Discord.Message} msg
 * @param {string} options Message options
 */
async function getSellers(msg, options) {
  if (options) return;

  try {
    const sellers = await dbUtil.getSellers();

    msg.channel.send(
      new Discord.MessageEmbed({
        ...BASE_EMBED_PROPS,
        title: 'Sellers (US)',
        description: sellers.map(x => x.title).join(', ')
      })
    );
  } catch (e) {
    console.error(e);
  }
}
