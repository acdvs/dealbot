'use strict';

const Discord = require('discord.js');
const apiUtil = require('../util/api');

/**
 * Get all sellers for a region
 * @param {Object} msg Discord message
 */
module.exports = async (msg) => {
  const sellers = await apiUtil.getSellers();

  const embed = new Discord.MessageEmbed({
    title: 'Sellers (US)',
    description: sellers.map(x => x.title).join(', '),
    color: 0x23B2D5
  });

  msg.channel.send({ embed });
};
