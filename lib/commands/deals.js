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

    // Can't rely on user input for the formal game name.
    // Formal name also isn't returned with game data in the next step.
    const gameInfo = await apiUtil.getGameInfo(gameId);
    const gameData = await apiUtil.getGameData(gameId, ignoredSellers);
    const list = gameData.list.filter(x => x.price_new < x.price_old);

    if (!gameData || list.length === 0) {
      msg.channel.send(`There are currently no deals on ${game}.`);
      return;
    }

    const sellers = list.map(x => `[${x.shop.name}](${x.url})`);
    const newPrices = list.map(x => `${toCurrency(x.price_new)} (-${x.price_cut}%)`);
    const oldPrices = list.map(x => toCurrency(x.price_old));

    const histLowData = await apiUtil.getHistoricalLow(gameId);
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

    // Check for field value overflow and replace all fields
    // with a note to go directly to ITAD instead.
    if (
      sellers.join('\n').length > CHAR_LIMIT ||
      newPrices.join('\n').length > CHAR_LIMIT ||
      oldPrices.join('\n').length > CHAR_LIMIT
    ) {
      embed.addField('Too many deals!', [
        'Looks like there are too many deals to display here.',
        'Click the link above to see them directly on IsThereAnyDeal.'
      ].join('\n'));
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

    if (histLowData) {
      embed.addFields({
        name: 'Historical Low',
        value: `${toCurrency(histLowData.price)} (-${histLowData.cut}%) from ${histLowData.shop.name}`
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
      embed.setFooter(`Ignored sellers: ${ignoredSellers.join(', ')}`);
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