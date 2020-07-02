'use strict';

const apiUtil = require('../util/api');
const settingsUtil = require('../util/settings');

/**
 * !ignoredsellers [add|remove] [seller]
 * @param {Object} msg Discord message
 * @param {string} options Message options
 * @param {Object} settings Instance settings
 */
module.exports = async (msg, options, settings) => {
  const [operation, seller] = options.split(/\s+(.*)/);
  let changed = false;

  try {
    if (operation === 'add') {
      const sellerId = await apiUtil.getSellerId(seller);

      if (sellerId && !settings.ignoredSellers.includes(sellerId)) {
        settings.ignoredSellers.push(sellerId);
        changed = true;
      }
    } else if (operation === 'remove') {
      const sellerId = await apiUtil.getSellerId(seller);
      const index = settings.ignoredSellers.indexOf(sellerId);

      if (index > -1) {
        settings.ignoredSellers.splice(index, 1);
        changed = true;
      }
    } else {
      msg.channel.send('Invalid option.\n`!ignoredsellers [add|remove] [seller]`');
    }
  } catch (e) {
    console.error(e);
  }

  if (changed) {
    settingsUtil.save(settings);
    msg.react('✅');
  }
};