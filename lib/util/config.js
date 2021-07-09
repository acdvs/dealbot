'use strict';

const PREFIX = '$';

module.exports = {
  CLIENT_OPTS: {
    shards: 'auto',
    messageCacheMaxSize: 0,
    messageCacheLifetime: 10,
    messageSweepInterval: 30,
    messageEditHistoryMaxSize: 0,
    presence: {
      activity: {
        type: 'WATCHING',
        name: `for ${PREFIX}deals`
      }
    },
    ws: {
      intents: ['GUILDS', 'GUILD_MESSAGES']
    }
  },
  PREFIX,
  DEFAULT_COOLDOWN: 3,
  BASE_EMBED_PROPS: {
    color: 0x23B2D5
  },
  REQUIRED_PERMISSIONS: [
    'VIEW_CHANNEL',
    'READ_MESSAGE_HISTORY',
    'SEND_MESSAGES',
    'MANAGE_MESSAGES',
    'EMBED_LINKS',
    'ADD_REACTIONS'
  ]
};
