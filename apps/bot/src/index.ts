import 'dotenv/config';
import { ActivityType, GatewayIntentBits } from 'discord.js';

import { Bot } from './bot';

const DealBot = new Bot({
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

DealBot.start(process.env.DISCORD_BOT_TOKEN!);
