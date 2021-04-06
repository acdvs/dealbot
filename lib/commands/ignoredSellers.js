'use strict';

const Discord = require('discord.js');
const db = require('../util/db');
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
  run
};

/**
 * Get, add, or remove ignored sellers
 * @param {Discord.Message} msg
 * @param {string} options Message options
 */
async function run(msg, options) {
  if (!options) {
    const ignoredSellers = await db.getIgnoredSellers(msg.guild.id);

    if (ignoredSellers?.length > 0) {
      msg.channel.send(
        new Discord.MessageEmbed({
          ...BASE_EMBED_PROPS,
          title: `Ignored sellers (${ignoredSellers.length})`,
          description: ignoredSellers
            .map(x => x.title)
            .sort()
            .join('\n')
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
    const hasIgnoredSeller = await db.hasIgnoredSeller(msg.guild.id, seller);

    if (operation === 'add') {
      if (!hasIgnoredSeller) {
        console.log('adding');
        changed = await db.insertIgnoredSeller(msg.guild.id, seller);
      } else {
        msg.channel.send('That seller is already ignored.');
      }
    } else if (operation === 'remove') {
      if (hasIgnoredSeller) {
        changed = await db.removeIgnoredSeller(msg.guild.id, seller);
      } else {
        msg.channel.send('That seller is not ignored.');
      }
    }
  } else if (operation === 'clear') {
    const ignoredSellers = await db.getIgnoredSellers(msg.guild.id);

    if (ignoredSellers?.length > 0) {
      changed = await db.clearIgnoredSellers(msg.guild.id);
    } else {
      msg.channel.send('No ignored sellers have been added.');
    }
  }

  if (changed) {
    msg.react('✅');
  }
}
