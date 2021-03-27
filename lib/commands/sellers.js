'use strict';

const Discord = require('discord.js');
const dbUtil = require('../util/db');

/**
 * Get all sellers for a region
 * @param {Object} msg Discord message
 */
module.exports = async (msg) => {
  try {
    const sellers = await dbUtil.getSellers();

    msg.channel.send(
      new Discord.MessageEmbed({
        author: {
          name: 'IsThereAnyDeal Lookup'
        },
        title: 'Sellers (US)',
        description: sellers.map(x => x.title).join(', '),
        color: 0x23B2D5
      })
    );
  } catch (e) {
    console.error(e);
  }
};
