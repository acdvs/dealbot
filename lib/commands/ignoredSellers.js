'use strict';

const Discord = require('discord.js');
const apiUtil = require('../util/api');
const settingsUtil = require('../util/settings');

/**
 * Get, add, or remove ignored sellers
 * @param {Object} msg Discord message
 * @param {string} options Message options
 * @param {Object} settings Instance settings
 */
module.exports = async (msg, options, settings) => {
  if (!options) {
    if (settings.ignoredSellers.length > 0) {
      const embed = new Discord.MessageEmbed({
        title: `Ignored sellers (${settings.ignoredSellers.length})`,
        description: settings.ignoredSellers.map(x => x.title).join('\n'),
        color: 0x23B2D5
      });

      msg.channel.send({ embed });
    } else {
      msg.channel.send('No ignored sellers have been added.');
    }

    return;
  }

  let [operation, seller] = options.split(/\s+(.*)/);
  let changed = false;

  try {
    if (operation === 'add') {
      const sellerIsIgnored = !!settings.ignoredSellers.find(x => x.title === seller);
      const sellers = await apiUtil.getSellers();

      seller = sellers.filter(x => x.title === seller);
      seller = seller && seller[0];

      if (seller && !sellerIsIgnored) {
        settings.ignoredSellers.push({ id: seller.id, title: seller.title });
        changed = true;
      }
    } else if (operation === 'remove') {
      const index = settings.ignoredSellers.findIndex(x => x.title === seller);

      if (index > -1) {
        settings.ignoredSellers.splice(index, 1);
        changed = true;
      }
    }
  } catch (e) {
    console.error(e);
  }

  if (changed) {
    settingsUtil.save(settings);
    msg.react('✅');
  }
};