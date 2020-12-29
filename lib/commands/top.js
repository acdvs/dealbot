'use strict';

const Discord = require('discord.js');
const apiUtil = require('../util/api');

/**
 * Get top games
 * @param {Object} msg Discord message
 * @param {string} option Message option
 */
module.exports = async (msg, option) => {
  let embed;

  try {
    if (option === 'waitlisted' || option === 'collected') {
      let title, list;

      if (option === 'waitlisted') {
        title = 'Top Waitlisted Games';
        list = await apiUtil.getWaitlistChart(20);
      } else {
        title = 'Top Collected Games';
        list = await apiUtil.getCollectionChart(20);
      }

      embed = new Discord.MessageEmbed({
        title: title,
        color: 0x23B2D5,
        fields: [
          {
            name: 'Game',
            value: list.map(x => `${x.position}. ${x.title}`).join('\n'),
            inline: true
          },
          {
            name: 'Count',
            value: list.map(x => formatNumber(x.count)).join('\n'),
            inline: true
          }
        ]
      });
    } else if (option === 'popular') {
      const popularities = await apiUtil.getPopularityChart(20);

      embed = new Discord.MessageEmbed({
        title: 'Top Games By Popularity',
        color: 0x23B2D5,
        description: [
          'Popularity is computed as normalized count in Waitlists',
          'plus normalized count in Collections.\n',
          popularities.map(x => `${x.position}. ${x.title}`).join('\n')
        ].join('\n')
      });
    }

    if (embed) {
      msg.channel.send({ embed });
    }
  } catch (e) {
    console.error(e);
  }
};

// =========================
// Helpers
// =========================

/**
 * Format numbers
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}