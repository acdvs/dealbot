'use strict';

const axios = require('axios');

const ITAD_KEY = process.env.ITAD_KEY;
const BASE_URL = 'https://api.isthereanydeal.com';

// eslint-disable-next-line consistent-return
async function retry(fn, retries = 3, interval = 3) {
  let errored = false;

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fn();

      if (errored) {
        console.log(`Received response after ${i + 1} tries.`);
      }

      return res;
    } catch (e) {
      errored = true;
      console.error(`ITAD API error. Retrying... (${i + 1})`);
      await sleep(interval);
    }
  }

  console.error(`No response received after ${retries} attempts.`);
  // eslint-disable-next-line no-throw-literal
  throw 'Unable to get info from IsThereAnyDeal. Please try again later.';
}

function sleep(sec) {
  return new Promise((resolve) => {
    setTimeout(resolve, sec * 1000);
  });
}

/**
 * Search for game by name
 * @param {string} game
 * @param {integer} limit Result limit
 * @returns {Array}
 */
exports.search = async (game, limit) => retry(async () => {
  const res = await axios.get(`${BASE_URL}/v02/search/search/`, {
    params: {
      key: ITAD_KEY,
      q: game,
      limit: limit,
      strict: 1
    }
  });

  const searchData = res.data.data;
  const list = searchData?.results
    .filter((v, i, a) => i === a.findIndex(x => x.title === v.title))
    .sort((a, b) => (a.title > b.title ? 1 : -1));

  return list;
});

/**
 * Get ITAD game ID
 * @param {string} game
 * @returns {string}
 */
exports.getGameId = async game => retry(async () => {
  const res = await axios.get(`${BASE_URL}/v02/game/plain/`, {
    params: {
      key: ITAD_KEY,
      title: game
    }
  });

  const gameId = res.data?.data?.plain;

  return gameId;
});

/**
 * Get game info from ID
 * @param {string} gameId ITAD internal game ID
 * @returns {Object}
 */
exports.getGameInfo = async gameId => retry(async () => {
  const res = await axios.get(`${BASE_URL}/v01/game/info/`, {
    params: {
      key: ITAD_KEY,
      plains: gameId
    }
  });

  const infoData = res.data?.data?.[gameId];

  return infoData;
});

/**
 * Get game prices and links
 * @param {string} gameId ITAD internal game ID
 * @param {Array} ignoredSellers
 * @returns {Object}
 */
exports.getGameDeals = async (gameId, ignoredSellers) => retry(async () => {
  const res = await axios.get(`${BASE_URL}/v01/game/prices/`, {
    params: {
      key: ITAD_KEY,
      plains: gameId,
      region: 'us',
      country: 'US',
      exclude: ignoredSellers?.map(x => x.id).join(',')
    }
  });

  const gameDeals = res.data?.data?.[gameId];

  return gameDeals;
});

/**
 * Get historical low for game
 * @param {string} gameId ITAD internal game ID
 * @returns {Object}
 */
exports.getHistoricalLow = async gameId => retry(async () => {
  const res = await axios.get(`${BASE_URL}/v01/game/lowest/`, {
    params: {
      key: ITAD_KEY,
      plains: gameId,
      region: 'us',
      country: 'US'
    }
  });

  const gameData = res.data?.data?.[gameId];

  return gameData;
});

/**
 * Get all sellers
 * @returns {Object}
 */
exports.getSellers = async () => retry(async () => {
  const res = await axios.get(`${BASE_URL}/v02/web/stores/`, {
    params: {
      region: 'us',
      country: 'US'
    }
  });

  return res.data?.data;
});

/**
 * Get top waitlisted games
 * @param {number} limit Number of results to get
 * @returns {Object}
 */
exports.getWaitlistChart = async limit => retry(async () => {
  const res = await axios.get(`${BASE_URL}/v01/stats/waitlist/chart/`, {
    params: {
      key: ITAD_KEY,
      limit: limit
    }
  });

  return res.data?.data;
});

/**
 * Get top collected games
 * @param {number} limit Number of results to get
 * @returns {Object}
 */
exports.getCollectionChart = async limit => retry(async () => {
  const res = await axios.get(`${BASE_URL}/v01/stats/collection/chart/`, {
    params: {
      key: ITAD_KEY,
      limit: limit
    }
  });

  return res.data?.data;
});

/**
 * Get most popular games
 * @param {number} limit Number of results to get
 * @returns {Object}
 */
exports.getPopularityChart = async limit => retry(async () => {
  const res = await axios.get(`${BASE_URL}/v01/stats/popularity/chart/`, {
    params: {
      key: ITAD_KEY,
      limit: limit
    }
  });

  return res.data?.data;
});
