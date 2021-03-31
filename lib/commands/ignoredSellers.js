'use strict';

const Discord = require('discord.js');
const dbUtil = require('../util/db');
const { DEFAULT_COOLDOWN, BASE_EMBED_PROPS } = require('../util/config');

module.exports = {
  name: 'ignoredsellers',
  usages: [
    {
      args: false,
      description: [
        'Lists all ignored sellers.',
        'Ignored sellers do not appear in `$deals` list.'
      ].join('\n')
    },
    {
      args: '[add|remove] [seller]',
      description: [
        'Adds or removes an ignored seller.',
        'Seller must be spelled exactly as it appears in the `$sellers` command.'
      ].join('\n')
    },
    {
      args: 'clear',
      description: 'Clears all previously added ignored sellers.'
    }
  ],
  permissions: 'ADMINISTRATOR',
  cooldown: DEFAULT_COOLDOWN,
  run: (msg, options) => handleIgnoredSellers(msg, options)
};

/**
 * Get, add, or remove ignored sellers
 * @param {Discord.Message} msg
 * @param {string} options Message options
 */
async function handleIgnoredSellers(msg, options) {
  if (!options) {
    const ignoredSellers = await dbUtil.getIgnoredSellers(msg.guild.id);

    if (ignoredSellers?.length > 0) {
      msg.channel.send(
        new Discord.MessageEmbed({
          ...BASE_EMBED_PROPS,
          title: `Ignored sellers (${ignoredSellers.length})`,
          description: ignoredSellers.map(x => x.title).join('\n')
        })
      );
    } else {
      msg.channel.send('No ignored sellers have been added.');
    }

    return;
  }

  let [operation, seller] = options.split(/\s+(.*)/);
  let changed = false;

  if (seller) {
    if (operation === 'add') {
      const sellerIsIgnored = await dbUtil.hasIgnoredSeller(msg.guild.id, seller);

      if (!sellerIsIgnored) {
        changed = await dbUtil.addIgnoredSeller(msg.guild.id, seller);
      }
    } else if (operation === 'remove') {
      const sellerIsIgnored = await dbUtil.hasIgnoredSeller(msg.guild.id, seller);

      if (sellerIsIgnored) {
        changed = await dbUtil.removeIgnoredSeller(msg.guild.id, seller);
      }
    }
  } else if (operation === 'clear') {
    changed = await dbUtil.clearIgnoredSellers(msg.guild.id);
  }

  if (changed) {
    msg.react('✅');
  }
}
