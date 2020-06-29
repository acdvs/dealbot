'use strict';

const Discord = require('discord.js');
const apiUtil = require('../util/api');

/**
 * !deals [game]
 * @param {Object} msg Discord message
 * @param {string} game
 */
module.exports = async (msg, game) => {
  try {
    const gameId = await apiUtil.getGameId(game);

    if (!gameId) {
      msg.channel.send(`Could not look up ${game}. Did you spell it correctly?`);
      return;
    }

    // Can't rely on user input for the formal game name.
    // Formal name also isn't returned with game data
    // in the next step.
    const gameName = await apiUtil.getGameName(gameId);
    const gameData = await apiUtil.getGameData(gameId);
    const list = gameData.list.filter(x => x.price_new < x.price_old);

    if (!gameData || list.length === 0) {
      msg.channel.send(`There are currently no deals on ${game}.`);
      return;
    }

    const sellers = list.map(x => x.shop.name);
    const newPrices = list.map(x => `${toCurrency(x.price_new)} (-${x.price_cut}%)`);
    const oldPrices = list.map(x => toCurrency(x.price_old));

    const histLowData = await apiUtil.getHistoricalLow(gameId);
    const historicalLow = histLowData ? `${histLowData.shop.name} @ ${toCurrency(histLowData.price)} (-${histLowData.cut}%)` : 'None';

    const metacriticScoreData = await apiUtil.getMetacriticData(gameId);
    const metacriticScore = metacriticScoreData.metacritic ? `${metacriticScoreData.metacritic.user_score}` : 'None';
    const metacriticUrl = metacriticScoreData.metacritic && `${metacriticScoreData.urls.metacritic}`;

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
        },
        {
          name: 'Historical Low',
          value: historicalLow
        },
        {
          name: 'Metacritic User Score',
          value: metacriticUrl ? `[${metacriticScore}](${metacriticUrl})` : `${metacriticScore}`
        }
      ],
      timestamp: new Date()
    });

    msg.channel.send({ embed });
  } catch (e) {
    console.error(e);
  }
};

// =========================
// Helpers
// =========================

/**
 * Convert number to currency format
 * @param {number} num
 * @returns {string}
 */
function toCurrency(num) {
  return `$${Number.parseFloat(num).toFixed(2)}`;
}