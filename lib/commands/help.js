'use strict';

const PREFIX = require('./index').COMMAND_PREFIX;

/**
 * !help
 * @param {Object} msg Discord message
 */
module.exports = (msg) => {
  msg.channel.send([
    '```',
    'Commands: help, deals, wishlist, ignoredsellers\n',
    `- ${PREFIX}help`,
    '    This command',
    `- ${PREFIX}deals [game name]`,
    '    Gets current deals on a specific game',
    `- ${PREFIX}wishlist [game names]`,
    '    Gets current deals on multiple games, add a \'-\' for games',
    '    with multiple words',
    `- ${PREFIX}ignoredsellers`,
    '    Lists all ignored sellers',
    `- ${PREFIX}ignoredsellers [add|remove] [seller]`,
    '    Adds or removes an ignored seller',
    '```'
  ].join('\n'));
};
