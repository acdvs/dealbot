'use strict';

/**
 * !help
 * @param {Object} msg Discord message
 */
module.exports = (msg) => {
  try {
    msg.channel.send(`
\`\`\`
Commands: help, deals, wishlist, add, delete

-Help: !help
    Go help yourself to some good deals.
-Deals: !deals [game name]
    Current deals on a specific game
-WishList: !wishlist [game names]
    Current deals on multiple games, add a '-' for games 
    with multiple words
\`\`\`
    `);
  } catch (e) {
    console.error(e);
  }
};
