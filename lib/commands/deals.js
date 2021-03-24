'use strict';

const Discord = require('discord.js');
const apiUtil = require('../util/api');
const dbUtil = require('../util/db');

const SEARCH_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
const CHAR_LIMIT = 1024;

/**
 * Get game deals
 * @param {Object} msg Discord message
 * @param {string} game
 */
module.exports = async (msg, game) => {
  if (!game) return;

  try {
    const gameId = await apiUtil.getGameId(game);

    if (gameId) {
      generateEmbed(msg, game, gameId);
    } else {
      let similarGames = await apiUtil.search(game, 5);

      if (similarGames.length > 0) {
        getAlternative(msg, similarGames, game);
      } else {
        msg.channel.send(`No results were found for "${game}". Did you spell it correctly?`);
      }
    }
  } catch (e) {
    console.error(e);
  }
};

/**
 * Offer alternative results with quick search reactions
 * @param {Discord.Message} msg
 * @param {Array} similarGames
 * @param {string} game
 * @returns {integer}
 */
async function getAlternative(msg, similarGames, game) {
  const reply = await msg.channel.send(
    new Discord.MessageEmbed({
      author: {
        name: 'Deal Lookup'
      },
      title: 'No Results',
      color: 0x23B2D5,
      description: [
        `An exact match was not found for "${game}".`,
        `[Click here](${getSearchUrl(game)}) to search directly on ITAD`,
        'or use a reaction to search a similar result below.\n',
        ...similarGames.map((v, i) => `${SEARCH_EMOJIS[i]} ${v.title}`)
      ].join('\n')
    })
  );

  // Add reaction options
  for (let i = 0; i < similarGames.length; i++) {
    reply.react(SEARCH_EMOJIS[i]);
  }

  // Create reaction collector
  const collectorFilter = (reaction, user) => SEARCH_EMOJIS.includes(reaction.emoji.name) && user.id === msg.author.id;
  const collector = reply.createReactionCollector(collectorFilter, { max: 1 });

  collector.on('collect', (r) => {
    const listIndex = SEARCH_EMOJIS.indexOf(r.emoji.name);
    const alternativeId = similarGames[listIndex].plain;
    const alternativeName = similarGames[listIndex].title;

    generateEmbed(msg, alternativeName, alternativeId);
  });

  collector.on('end', () => reply.reactions.removeAll());
}

/**
 * Get game deals
 * @param {Discord.Message} msg Discord message
 * @param {string} game
 * @param {integer} gameId
 */
async function generateEmbed(msg, game, gameId) {
  try {
    const ignoredSellers = await dbUtil.getIgnoredSellers(msg.guild.id);
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

    let rowCount = 0;
    let sellersFieldVal;

    // Check for field value overflow and add an extra line
    // with a link to ITAD for deals that don't fit.
    if (sellers.join('\n').length > CHAR_LIMIT) {
      // Overflow row needs to be predetermined to account for
      // its possible length for insertion.
      const getOverflowText = currRowCount => `[...and ${sellers.length - currRowCount} more deals](${gameData.urls.game})`;

      let charTotal = getOverflowText(100).length;

      for (let i = 0; i < sellers.length; i++) {
        charTotal += sellers[i].length;

        if (charTotal > CHAR_LIMIT) {
          rowCount = i - 1;
          break;
        }
      }

      sellersFieldVal = [
        ...sellers.slice(0, rowCount),
        getOverflowText(rowCount)
      ].join('\n');
    } else {
      rowCount = sellers.length;
      sellersFieldVal = sellers.join('\n');
    }

    embed.addFields([
      {
        name: 'Seller',
        value: sellersFieldVal,
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
}

// =========================
// Helpers
// =========================

/**
 * Get an ITAD search URL
 * @param {string} name
 * @returns {string}
 */
function getSearchUrl(name) {
  const BASE_URL = 'https://isthereanydeal.com/search/?q=';

  return BASE_URL + name.replace(/\s/g, '+');
}

/**
 * Convert number to currency format
 * @param {number} num
 * @returns {string}
 */
function toCurrency(num) {
  const price = Number.parseFloat(num).toFixed(2);

  return price > 0 ? `$${price}` : 'FREE';
}
