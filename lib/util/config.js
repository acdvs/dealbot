'use strict';

const PREFIX = '$';

module.exports = {
  CLIENT_OPTS: {
    shards: 'auto',
    messageCacheMaxSize: 5,
    messageCacheLifetime: 3600,
    messageSweepInterval: 300,
    messageEditHistoryMaxSize: 0,
    presence: {
      activity: {
        type: 'WATCHING',
        name: `for ${PREFIX}deals`
      }
    },
    ws: {
      intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS']
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
