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
-WishList: !wishlist -deals
    Current game wishlist, add deals flag to get all deals
    for wishlist
-Add: !add [game name]
    Add game to wishlist
-Delete: !delete [game name]
    Delete game from wishlist
\`\`\`
    `);
  } catch (e) {
    console.error(e);
  }
};
