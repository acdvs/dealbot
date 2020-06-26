'use strict';

const getDeals = require('./getDeals.js');

/**
 * !wishlist -deals
 * @param {Object} msg Discord message
 * @param {string []} gameList
 * @param {string} getDealsflag
 */
module.exports = (msg, gameList, getDealsFlag) => {
  try {
    // Right now this will return deals for multiple games, need to save the list
    gameList.forEach(async (game) => {
      await getDeals(msg, game);
    });
  } catch (e) {
    console.error(e);
  }
};
