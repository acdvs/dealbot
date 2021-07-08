'use strict';

const Discord = require('discord.js');
const apiUtil = require('../util/api');
const db = require('../util/db');
const { createBasicEmbed } = require('../util/helpers');
const { DEFAULT_COOLDOWN, BASE_EMBED_PROPS } = require('../util/config');

const SEARCH_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
const CHAR_LIMIT = 1024;

module.exports = {
  name: 'deals',
  usages: [{
    args: '[game]',
    description: [
      'Gets a list of current deals for the specified game.',
      'Lookup relies on spelling, so misspellings may return nothing.',
      'If an exact match is not found, the bot will attempt to suggest something similar.'
    ].join('\n')
  }],
  cooldown: DEFAULT_COOLDOWN,
  run
};

/**
 * Get game deals
 * @param {Discord.Message} msg
 * @param {string} game User input game name
 */
async function run(msg, game) {
  if (!game) return;

  try {
    const gameId = await apiUtil.getGameId(game);

    if (gameId) {
      generateEmbed(msg, game, gameId);
    } else {
      const similarGames = await apiUtil.search(game, 5);

      if (similarGames?.length > 0) {
        getAlternative(msg, game, similarGames);
      } else {
        msg.channel.send(createBasicEmbed(`No results were found for "${game}". Did you spell it correctly?`));
      }
    }
  } catch (e) {
    msg.channel.send(createBasicEmbed(e));
  }
}

/**
 * Offer alternative results with quick search reactions
 * @param {Discord.Message} msg
 * @param {string} game User input game name
 * @param {Array} similarGames
 */
async function getAlternative(msg, game, similarGames) {
  const reply = await msg.channel.send(
    new Discord.MessageEmbed({
      ...BASE_EMBED_PROPS,
      title: 'Similar Results',
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
 * @param {Discord.Message} msg
 * @param {string} game User input game name
 * @param {integer} gameId ITAD game ID
 */
async function generateEmbed(msg, game, gameId) {
  let gameDeals, gameInfo, histLowData;

  const ignoredSellers = await db.getIgnoredSellers(msg.guild.id);

  try {
    gameDeals = await apiUtil.getGameDeals(gameId, ignoredSellers);
    gameInfo = await apiUtil.getGameInfo(gameId);
    histLowData = await apiUtil.getHistoricalLow(gameId);
  } catch (e) {
    msg.channel.send(createBasicEmbed(e));
  }

  const gameTitle = gameInfo?.title || titleCase(game);

  if (!gameDeals || !gameInfo) {
    msg.channel.send(createBasicEmbed(`Unable to get info from IsThereAnyDeal for ${gameTitle}. Please try again later.`));
    return;
  }

  const list = gameDeals.list.filter(x => x.price_new < x.price_old);

  let embed = new Discord.MessageEmbed({
    ...BASE_EMBED_PROPS,
    title: gameTitle,
    url: gameDeals.urls.game
  });

  if (!list || list.length === 0) {
    embed.setDescription('No deals found.');
    embed.setThumbnail(gameInfo.image);
  } else {
    const sellers = list.map(x => `[${x.shop.name}](${x.url})`);
    const sellersJoin = '\n';
    const shortenedSellers = getSellersFieldVal(sellers, gameDeals, sellersJoin);
    const priceSliceEnd = sellers.length !== shortenedSellers.length
      ? shortenedSellers.length - 1
      : sellers.length;

    const newPrices = list.map(x => `${toCurrency(x.price_new)} (-${x.price_cut}%)`);
    const oldPrices = list.map(x => toCurrency(x.price_old));
    const steamReview = gameInfo.reviews?.steam;

    embed.setImage(gameInfo.image);
    embed.addFields([
      {
        name: 'Seller',
        value: shortenedSellers.join(sellersJoin),
        inline: true
      },
      {
        name: 'New Price',
        value: newPrices.slice(0, priceSliceEnd).join(sellersJoin),
        inline: true
      },
      {
        name: 'Old Price',
        value: oldPrices.slice(0, priceSliceEnd).join(sellersJoin),
        inline: true
      }
    ]);

    if (histLowData) {
      embed.addFields({
        name: 'Historical Low',
        value: histLowData.price === 0
          ? `${toCurrency(histLowData.price)} from ${histLowData.shop.name}`
          : `${toCurrency(histLowData.price)} (-${histLowData.cut}%) from ${histLowData.shop.name}`
      });
    }

    if (steamReview) {
      embed.addFields({
        name: 'Steam User Review',
        value: `${steamReview.text} (${steamReview.perc_positive}% from ${steamReview.total} users)`
      });
    }
  }

  if (ignoredSellers?.length > 0) {
    const overflowText = count => `and ${count} more`;
    const joinChars = ', ';

    const ignoredSellerTitles = ignoredSellers.map(x => x.title);
    const shortenedList = truncateJoinedList(ignoredSellerTitles, joinChars, 40, 0, overflowText);

    embed.setFooter(`Ignored sellers: ${shortenedList.sort().join(joinChars)}`);
  }

  msg.channel.send({ embed });
}

/**
 * Check for field value overflow and add an extra line
 * with a link to ITAD for deals that don't fit.
 * @param {Array} sellers
 * @param {Object} gameDeals
 * @param {string} joinChars Characters to join sellers with
 * @returns {Array}
 */
function getSellersFieldVal(sellers, gameDeals, joinChars) {
  let finalList = [...sellers];

  if (sellers.join(joinChars).length > CHAR_LIMIT) {
    const overflowText = count => `[...and ${count} more deals](${gameDeals.urls.game})`;
    const charTotalStart = overflowText(100).length;

    finalList = truncateJoinedList(sellers, joinChars, CHAR_LIMIT, charTotalStart, overflowText);
  }

  return finalList;
}

/**
 * Truncates a list based on it's strigified length.
 * Only uses `joinChars` to calculate final length and
 * does not actually return a joined array (string).
 * @param {Array} list
 * @param {string} joinChars Characters to join list with
 * @param {integer} charLimit Length limit for joined list
 * @param {integer} charTotalStart Number to start `charLimit` at
 * @param {Function} overflowText Text to concat to truncated list
 * @returns {Array} Truncated list
 */
function truncateJoinedList(list, joinChars, charLimit, charTotalStart, overflowText) {
  let finalCount = list.length;
  let charTotal = charTotalStart || 0;

  for (let i = 0; i < list.length; i++) {
    if (i > 0) {
      charTotal += joinChars.length;
    }

    charTotal += list[i].length;

    if (charTotal > charLimit) {
      finalCount = i - 1;
      break;
    }
  }

  let shortenedList = list.slice(0, finalCount);

  if (overflowText && list.length > finalCount) {
    shortenedList.push(overflowText(list.length - finalCount));
  }

  return shortenedList;
}

function titleCase(str) {
  return str.replace(/\b([A-Za-z])/g, String.call.bind('$1'.toUpperCase));
}

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
