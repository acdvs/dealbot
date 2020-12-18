'use strict';

const Discord = require('discord.js');
const apiUtil = require('../util/api');

const CHAR_LIMIT = 1024;

/**
 * !deals [game]
 * @param {Object} msg Discord message
 * @param {string} game
 */
module.exports = async (msg, game, ignoredSellers) => {
  try {
    const gameId = await apiUtil.getGameId(game);

    if (!gameId) {
      const gameList = await apiUtil.search(game);

      if (gameList.length > 0) {
        // Map titles, remove duplicates, sort alphabetically
        const titles = gameList
          .map(x => x.title)
          .filter((v, i, a) => a.indexOf(v) === i)
          .sort();

        msg.channel.send(`Could not look up "${game}".\n\n**Here are some suggestions:**\n${titles.join('\n')}`);
      } else {
        msg.channel.send(`Could not look up "${game}". Did you spell it correctly?`);
      }

      return;
    }

    const gameData = await apiUtil.getGameData(gameId, ignoredSellers);
    const list = gameData && gameData.list.filter(x => x.price_new < x.price_old);

    if (!list || list.length === 0) {
      msg.channel.send(`There are currently no deals on ${game}.`);
      return;
    }

    const sellers = list.map(x => `[${x.shop.name}](${x.url})`);
    const newPrices = list.map(x => `${toCurrency(x.price_new)} (-${x.price_cut}%)`);
    const oldPrices = list.map(x => toCurrency(x.price_old));

    // Can't rely on user input for the formal game name.
    const gameInfo = await apiUtil.getGameInfo(gameId);
    const embed = new Discord.MessageEmbed({
      author: {
        name: 'Deal Lookup'
      },
      image: {
        url: gameInfo.image
      },
      title: gameInfo.title || gameId,
      url: gameData.urls.game,
      color: 0x23B2D5
    });

    // Check for field value overflow and add an extra line
    // with a link to ITAD for deals that don't fit.
    if (sellers.join('\n').length > CHAR_LIMIT) {
      let charTotal = 0;
      let rowCount = 0;

      for (let i = 0; i < sellers.length; i++) {
        charTotal += sellers[i].length;

        if (charTotal > CHAR_LIMIT) {
          rowCount = i - 1;
          break;
        }
      }

      embed.addFields([
        {
          name: 'Seller',
          value: [
            ...sellers.slice(0, rowCount),
            `[...and ${sellers.length - rowCount} more deals](${gameData.urls.game})`
          ].join('\n'),
          inline: true
        },
        {
          name: 'New Price',
          value: newPrices.slice(0, rowCount).join('\n'),
          inline: true
        },
        {
          name: 'Old Price',
          value: oldPrices.slice(0, rowCount).join('\n'),
          inline: true
        }
      ]);
    } else {
      embed.addFields([
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
      ]);
    }

    const histLowData = await apiUtil.getHistoricalLow(gameId);

    if (histLowData) {
      embed.addFields({
        name: 'Historical Low',
        value: histLowData.price === 0
          ? `${toCurrency(histLowData.price)} from ${histLowData.shop.name}`
          : `${toCurrency(histLowData.price)} (-${histLowData.cut}%) from ${histLowData.shop.name}`
      });
    }

    if (gameInfo.reviews && gameInfo.reviews.steam) {
      const steamReview = gameInfo.reviews.steam;

      embed.addFields({
        name: 'Steam User Review',
        value: `${steamReview.text} (${steamReview.perc_positive}% from ${steamReview.total} users)`
      });
    }

    if (ignoredSellers.length > 0) {
      embed.setFooter(`Ignored sellers: ${ignoredSellers.map(x => x.title).join(', ')}`);
    }

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
  const price = Number.parseFloat(num).toFixed(2);

  return price > 0 ? `$${price}` : 'FREE';
}