'use strict';

const Discord = require('discord.js');
const dbUtil = require('../util/db');

/**
 * Get, add, or remove ignored sellers
 * @param {Object} msg Discord message
 * @param {string} options Message options
 */
module.exports = async (msg, options) => {
  if (!options) {
    const ignoredSellers = await dbUtil.getIgnoredSellers(msg.guild.id);

    if (ignoredSellers.length > 0) {
      msg.channel.send(
        new Discord.MessageEmbed({
          title: `Ignored sellers (${ignoredSellers.length})`,
          description: ignoredSellers.map(x => x.title).join('\n'),
          color: 0x23B2D5
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
};
