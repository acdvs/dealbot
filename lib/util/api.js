'use strict';

const axios = require('axios');

const ITAD_KEY = process.env.ITAD_KEY;
const BASE_URL = 'https://api.isthereanydeal.com';

/**
 * Get ITAD game ID
 * @param {string} game
 * @returns {string}
 */
const getGameId = async (game) => {
  const plainRes = await axios.get(`${BASE_URL}/v02/game/plain/`, {
    params: {
      key: ITAD_KEY,
      title: game
    }
  });

  const plainData = plainRes.data.data;
  const gameId = plainData && plainData.plain;

  return gameId;
};

/**
 * Get formal game name from ID
 * @param {string} gameId ITAD internal game ID
 * @returns {string}
 */
const getGameName = async (gameId) => {
  const res = await axios.get(`${BASE_URL}/v01/game/info/`, {
    params: {
      key: ITAD_KEY,
      plains: gameId
    }
  });

  const infoData = res.data.data && res.data.data[gameId];
  const gameName = infoData.title;

  return gameName;
};

/**
 * Get game prices and links
 * @param {string} gameId ITAD internal game ID
 * @returns {Object}
 */
const getGameData = async (gameId, ignoredSellers) => {
  const res = await axios.get(`${BASE_URL}/v01/game/prices/`, {
    params: {
      key: ITAD_KEY,
      plains: gameId,
      region: 'us',
      country: 'US',
      exclude: ignoredSellers.join(',')
    }
  });

  const gameData = res.data.data && res.data.data[gameId];

  return gameData;
};

/**
 * Get historical low for game
 * @param {string} gameId ITAD internal game ID
 * @returns {Object}
 */
const getHistoricalLow = async (gameId) => {
  const res = await axios.get(`${BASE_URL}/v01/game/lowest/`, {
    params: {
      key: ITAD_KEY,
      plains: gameId,
      region: 'us',
      country: 'US'
    }
  });

  const gameData = res.data.data && res.data.data[gameId];

  return gameData;
};

/**
 * Get Metacritic game summary and reviews
 * @param {string} gameId ITAD internal game ID
 * @returns {Object}
 */
const getMetacriticData = async (gameId) => {
  const res = await axios.get(`${BASE_URL}/v01/game/info/`, {
    params: {
      key: ITAD_KEY,
      plains: gameId,
      optional: 'metacritic'
    }
  });

  const gameData = res.data.data && res.data.data[gameId];

  return gameData;
};

/**
 * Get Metacritic game summary and reviews
 * @param {string} seller Full seller name
 * @returns {string}
 */
const getSellerId = async (seller) => {
  const res = await axios.get(`${BASE_URL}/v02/web/stores/`, {
    params: {
      region: 'us',
      country: 'US'
    }
  });

  const sellers = res.data && res.data.data;
  const filteredSellers = sellers.filter(x => x.title === seller);
  const sellerId = filteredSellers.length > 0 && filteredSellers[0].id;

  return sellerId;
};

module.exports = {
  getGameId,
  getGameName,
  getGameData,
  getHistoricalLow,
  getMetacriticData,
  getSellerId
};