'use strict';

const Discord = require('discord.js');
const GABEN_IMAGE_URL = 'https://cdn.discordapp.com/avatars/722942824999288924/399dcee64a83fd018dafda7d95c7a277.png';

/**
 * List all commands
 * @param {Object} msg Discord message
 * @param {string} prefix Command prefix
 */
module.exports = (msg, prefix, client) => {
  const serverCount = client.guilds.cache.size;
  const s = serverCount !== 1 ? 's' : '';

  const embed = new Discord.MessageEmbed({
    title: 'IsThereAnyDeal Lookup Help',
    description: [
      'If you like the bot, consider helping with monthly server costs.',
      '[Donate via Patreon](https://www.patreon.com/acdvs). Any amount helps!'
    ].join('\n'),
    color: 0x23B2D5,
    fields: [
      {
        name: `${prefix}deals [game]`,
        value: [
          'Gets a list of current deals for the specified game.',
          'Lookup relies on spelling, so misspellings may return nothing.',
          'If an exact match is not found, the bot will attempt to suggest something similar.'
        ].join('\n')
      },
      {
        name: `${prefix}top [waitlisted|collected|popular]`,
        value: 'Gets the top most waitlisted, collected, or popular games.'
      }
    ],
    footer: {
      text: `Currently in ${serverCount} server${s}`,
      icon_url: GABEN_IMAGE_URL
    }
  });

  if (msg.author.id === msg.guild.owner.id) {
    embed.addFields([
      {
        name: `${prefix}sellers`,
        value: [
          '__admin only__',
          'Lists all sellers.'
        ].join('\n')
      },
      {
        name: `${prefix}ignoredsellers`,
        value: [
          '__admin only__',
          'Lists all ignored sellers.',
          'Ignored sellers do not appear in `$deals` list.'
        ].join('\n')
      },
      {
        name: `${prefix}ignoredsellers [add|remove] [seller]`,
        value: [
          '__admin only__',
          'Adds or removes an ignored seller.',
          'Seller must be spelled exactly as it appears in the `$sellers` command.'
        ].join('\n')
      },
      {
        name: `${prefix}ignoredsellers clear`,
        value: [
          '__admin only__',
          'Clears all previously added ignored sellers.'
        ].join('\n')
      }
    ]);
  }

  msg.channel.send({ embed });
};
