'use strict';

const getDeals = require('./deals.js');

/**
 * !wishlist -deals
 * @param {Object} msg Discord message
 * @param {string[]} gameList
 * @param {string} getDealsflag
 */
module.exports = (msg, gameList, getDealsFlag) => {
  // Right now this will return deals for multiple games, need to save the list
  gameList = gameList.slice().split(',');

  for (let game of gameList) {
    getDeals(msg, game);
  }
};
