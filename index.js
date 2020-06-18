'use strict';

require('dotenv').config();

const axios = require('axios');
const Discord = require('discord.js');
const bot = new Discord.Client();

const BOT_TOKEN = process.env.BOT_TOKEN;
const ITAD_KEY = process.env.ITAD_KEY;

const COMMAND_PREFIX = '!';
const C_DEALS = `${COMMAND_PREFIX}deals`;

// =========================
// Start bot
// =========================

bot.login(BOT_TOKEN);

bot.on('ready', () => {
  console.log(bot.user.username + ' successfully started');

  bot.user.setPresence({ activity: { type: 'WATCHING', name: `for ${C_DEALS}` }});
});

// =========================
// On message
// =========================

bot.on('message', async (msg) => {
  const [command, options] = msg.content.split(/\s+(.*)/);

  switch (command) {
    case C_DEALS:
      await priceLookup(msg, options);
      break;
  }
});

// =========================
// Commands
// =========================

/**
 * !deals [game]
 * @param {Object} msg Discord message
 * @param {string} game
 */
async function priceLookup(msg, game) {
  console.log(game);

  try {
    const gameId = await getGameId(game);

    if (!gameId) {
      msg.channel.send(`Could not look up ${game}. Did you spell it correctly?`);
      return;
    }

    // Can't rely on user input for the formal game name.
    // Formal name also isn't returned with game data
    // in the next step.
    const gameName = await getGameName(gameId);
    const gameData = await getGameData(gameId);
    const list = gameData.list.filter(x => x.price_new < x.price_old);

    if (!gameData || list.length === 0) {
      msg.channel.send(`There are currently no deals on ${game}.`);
      return;
    }

    const sellers = list.map(x => x.shop.name);
    const newPrices = list.map(x => `${toCurrency(x.price_new)} (-${x.price_cut}%)`);
    const oldPrices = list.map(x => toCurrency(x.price_old));

    const embed = new Discord.MessageEmbed({
      author: {
        name: 'Deal Lookup'
      },
      title: gameName || gameId,
      url: gameData.urls.game,
      color: 0x23B2D5,
      fields: [
        {
          name: 'Seller',
          value: sellers.join('\n'),
          inline: true
        },
        {
          name: 'New Price',
          value: newPrices.join('\n'),
          inline: true
        },
        {
          name: 'Old Price',
          value: oldPrices.join('\n'),
          inline: true
        }
      ],
      timestamp: new Date()
    });

    msg.channel.send({ embed });
  } catch (e) {
    console.error(e);
  }
}

// =========================
// Helpers
// =========================

/**
 * Get ITAD game ID
 * @param {string} game
 * @returns {string}
 */
async function getGameId(game) {
  const plainRes = await axios.get('https://api.isthereanydeal.com/v02/game/plain/', {
    params: {
      key: ITAD_KEY,
      title: game
    }
  });

  const plainData = plainRes.data.data;
  const gameId = plainData && plainData.plain;

  return gameId;
}

/**
 * Get formal game name from ID
 * @param {string} gameId ITAD internal game ID
 * @returns {string}
 */
async function getGameName(gameId) {
  const infoRes = await axios.get('https://api.isthereanydeal.com/v01/game/info/', {
    params: {
      key: ITAD_KEY,
      plains: gameId
    }
  });

  const infoData = infoRes.data.data && infoRes.data.data[gameId];
  const gameName = infoData.title;

  return gameName;
}

/**
 * Get game prices and links
 * @param {string} gameId ITAD internal game ID
 * @returns {Object}
 */
async function getGameData(gameId) {
  const gameRes = await axios.get('https://api.isthereanydeal.com/v01/game/prices/', {
    params: {
      key: ITAD_KEY,
      plains: gameId,
      region: 'us',
      country: 'US'
    }
  });

  const gameData = gameRes.data.data && gameRes.data.data[gameId];

  return gameData;
}

/**
 * Convert number to currency format
 * @param {number} num
 * @returns {string}
 */
function toCurrency(num) {
  return `$${Number.parseFloat(num).toFixed(2)}`;
}