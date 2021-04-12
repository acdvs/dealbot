'use strict';

const { Op } = require('sequelize');
const { sequelize } = require('./instance');
const { Guild, Seller, IgnoredSeller } = require('./models');

/**
 * Get guild count
 * @returns {integer} Guild count
 */
const getGuildCount = async () => {
  try {
    const count = await Guild.count();

    return count;
  } catch (e) {
    console.error('Unable to get guild count:', e);
    return null;
  }
};

/**
 * Insert guild ID
 * @param {integer} id Discord guild ID
 * @returns {Guild} Guild
 */
const insertGuild = async (id) => {
  try {
    const guild = await Guild.create({ id });

    return guild;
  } catch (e) {
    console.error('Unable to insert guild:', e);
    return null;
  }
};

/**
 * Remove server ID
 * @param {integer} id Discord guild ID
 * @returns {integer} Removed row count
 */
const removeGuild = async (id) => {
  try {
    const removedCount = await Guild.destroy({ where: { id }});

    return removedCount;
  } catch (e) {
    console.error('Unable to remove guild:', e);
    return 0;
  }
};

/**
 * Get all sellers
 * @returns {Array} Sellers
 */
const getSellers = async () => {
  try {
    const sellers = await Seller.findAll();

    return sellers;
  } catch (e) {
    console.error('Unable to get sellers:', e);
    return null;
  }
};

/**
 * Get ignored sellers for a server
 * @param {integer} guildId Discord guild ID
 * @returns {Array} Ignored sellers
 */
const getIgnoredSellers = async (guildId) => {
  try {
    const guild = await Guild.findByPk(guildId, {
      include: [{
        model: Seller,
        as: 'sellers'
      }]
    });

    return guild?.sellers;
  } catch (e) {
    console.error('Unable to get ignored sellers:', e);
    return null;
  }
};

/**
 * Check if guild has ignored seller
 * @param {integer} guildId Discord guild ID
 * @param {string} sellerTitle ITAD seller title
 * @returns {boolean} Has ignored seller?
 */
const hasIgnoredSeller = async (guildId, sellerTitle) => {
  try {
    const guild = await Guild.findByPk(guildId, {
      include: [{
        model: Seller,
        as: 'sellers',
        where: getSellerTitleSearch(sellerTitle)
      }]
    });

    return guild?.sellers?.[0].ignored_seller || false;
  } catch (e) {
    console.error('Unable to check for ignored seller:', e);
    return false;
  }
};

/**
 * Add ignored seller to server
 * @param {integer} guildId Discord guild ID
 * @param {string} sellerTitle ITAD seller title
 * @returns {boolean} Inserted?
 */
const insertIgnoredSeller = async (guildId, sellerTitle) => {
  try {
    const server = await Guild.findByPk(guildId);
    const seller = await Seller.findOne({ where: getSellerTitleSearch(sellerTitle) });

    if (!server || !seller) return false;

    const ignoredSeller = await server.addSeller(seller);

    return !!ignoredSeller;
  } catch (e) {
    console.error('Unable to insert ignored seller:', e);
    return false;
  }
};

/**
 * Remove ignored seller from server
 * @param {integer} guildId Discord guild ID
 * @param {string} sellerTitle ITAD seller title
 * @returns {boolean} Removed?
 */
const removeIgnoredSeller = async (guildId, sellerTitle) => {
  try {
    const server = await Guild.findByPk(guildId);
    const seller = await Seller.findOne({ where: getSellerTitleSearch(sellerTitle) });

    if (!server || !seller) return false;

    const removedCount = await server.removeSeller(seller);

    return removedCount > 0;
  } catch (e) {
    console.error('Unable to remove ignored seller:', e);
    return false;
  }
};

/**
 * Clear all ignored sellers from server
 * @param {integer} guildId Discord guild ID
 * @returns {boolean} Cleared?
 */
const clearIgnoredSellers = async (guildId) => {
  try {
    const removedCount = await IgnoredSeller.destroy({ where: { guildId }});

    return removedCount > 0;
  } catch (e) {
    console.error('Unable to clear ignored sellers:', e);
    return false;
  }
};

/**
 * Open the database
 * @param {Discord.Client} bot
 */
const openDatabase = async (bot) => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    const guilds = bot.guilds.cache;
    const storedGuildCount = await getGuildCount();

    if (storedGuildCount !== guilds.size) {
      console.log('\nGuild count mismatch. Updating...');

      const guildIds = guilds.map(guild => ({ id: guild.id }));
      await Guild.bulkCreate(guildIds);

      console.log('Guilds updated!\n');
    }
  } catch (e) {
    console.error('Database connection failed:', e);
  }
};

/**
 * Generate seller title `OR` search params to allow for
 * accidental seller ID input
 * @param {string} sellerTitle ITAD seller title
 */
function getSellerTitleSearch(sellerTitle) {
  return {
    [Op.or]: [
      { id: sellerTitle },
      { title: sellerTitle }
    ]
  };
}

module.exports = {
  openDatabase,
  insertGuild,
  removeGuild,
  getSellers,
  getIgnoredSellers,
  hasIgnoredSeller,
  insertIgnoredSeller,
  removeIgnoredSeller,
  clearIgnoredSellers
};
