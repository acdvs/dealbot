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
    gameList = gameList.slice().split(' ');

    for (let game of gameList) {
      getDeals(msg, game);
    }
  } catch (e) {
    console.error(e);
  }
};
