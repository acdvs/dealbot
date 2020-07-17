'use strict';

/**
 * !help
 * @param {Object} msg Discord message
 */
module.exports = (msg) => {
  msg.channel.send([
    '```',
    'Commands: help, deals, wishlist, ignoredsellers\n',
    `- !help`,
    '    This command',
    `- !deals [game name]`,
    '    Gets current deals on a specific game',
    `- !ignoredsellers`,
    '    Lists all ignored sellers',
    `- !ignoredsellers [add|remove] [seller]`,
    '    Adds or removes an ignored seller',
    '```'
  ].join('\n'));
};
