import 'dotenv/config';
import { ClientOptions } from 'discord.js';
import { ActivityType, GatewayIntentBits } from 'discord-api-types/v10';

import Bot from '@/structures/Bot';

const DealBot = new Bot(<ClientOptions>{
  presence: {
    activities: [
      {
        type: ActivityType.Watching,
        name: `for /deals`,
      },
    ],
  },
  intents: [GatewayIntentBits.Guilds],
});

DealBot.start(process.env.BOT_TOKEN as string);
