'use strict';

const Discord = require('discord.js');

/**
 * List all commands
 * @param {Object} msg Discord message
 * @param {string} prefix Command prefix
 */
module.exports = (msg, prefix) => {
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
        name: `${prefix}sellers`,
        value: 'Lists all sellers.'
      },
      {
        name: `${prefix}ignoredsellers`,
        value: [
          'Lists all ignored sellers.',
          'Ignored sellers do not appear in `$deals` list.'
        ].join('\n')
      },
      {
        name: `${prefix}ignoredsellers [add|remove|clear] [seller]`,
        value: [
          'Adds or removes an ignored seller.',
          'Seller must be spelled exactly as it appears in the `$sellers` command.'
        ].join('\n')
      },
      {
        name: `${prefix}top [waitlisted|collected|popular]`,
        value: 'Gets the top waitlisted, collected, or popular games.'
      }
    ]
  });

  msg.channel.send({ embed });
};
