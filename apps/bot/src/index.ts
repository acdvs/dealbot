import 'dotenv/config';

import { Bot } from './bot';

const DealBot = new Bot();
DealBot.start(process.env.DISCORD_BOT_TOKEN!);
