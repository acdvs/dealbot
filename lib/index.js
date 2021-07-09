'use strict';

// Dynamic command setup derived from https://discordjs.guide/command-handling

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');

const db = require('./util/db');
const {
  CLIENT_OPTS,
  PREFIX,
  DEFAULT_COOLDOWN,
  REQUIRED_PERMISSIONS
} = require('./util/config');
const {
  createBasicEmbed,
  authorHasPerms
} = require('./util/helpers');

const bot = new Discord.Client(CLIENT_OPTS);
bot.commands = new Discord.Collection();
bot.cooldowns = new Discord.Collection();

const commandFiles = fs.readdirSync(path.join(__dirname, './commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.name, command);
}

// =========================
// Start bot
// =========================

bot.login(process.env.BOT_TOKEN)
  .then(() => {
    console.log(`${bot.user.username} logged in`);
    db.openDatabase(bot);
  })
  .catch(err => console.error(err));

// =========================
// Events
// =========================

bot.on('ready', () => {
  console.log(`${bot.user.username} successfully started`);
});

bot.on('message', (msg) => {
  if (
    !msg.guild ||
    !msg.author ||
    !msg.content?.startsWith(PREFIX) ||
    msg.author === bot.user
  ) {
    return;
  }

  const [prefixedCommand, options] = msg.content.split(/\s+(.*)/);
  const command = bot.commands.get(prefixedCommand.substring(1));

  if (!command) return;

  // Handle insufficient user permissions
  if (command.permissions && !authorHasPerms(command, msg)) {
    return;
  }

  // Handle insufficient bot permissions
  const channelBotPermissions = msg.channel.permissionsFor(bot.user);

  if (!channelBotPermissions.has('EMBED_LINKS')) {
    msg.channel.send(`I need the \`EMBED_LINKS\` permission to do my job.`);
    return;
  }

  for (const perm of REQUIRED_PERMISSIONS) {
    if (!channelBotPermissions.has(perm)) {
      msg.channel.send(createBasicEmbed(`I need the \`${perm}\` permission to do my job.`));
      return;
    }
  }

  // Handle cooldown
  if (!bot.cooldowns.has(command.name)) {
    bot.cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = bot.cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || DEFAULT_COOLDOWN) * 1000;

  if (timestamps.has(msg.guild.id)) {
    const expirationTime = timestamps.get(msg.guild.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      const s = timeLeft !== 1 ? 's' : '';

      msg.channel.send(createBasicEmbed(`The \`${PREFIX}${command.name}\` command can be used again in ${timeLeft.toFixed(1)} second${s}.`));

      return;
    }
  }

  timestamps.set(msg.guild.id, now);
  setTimeout(() => timestamps.delete(msg.guild.id), cooldownAmount);

  // Execute command
  try {
    command.run(msg, options);
  } catch (e) {
    console.error('Command execution error\n', e);
    msg.channel.send(createBasicEmbed('Unable to process that command. Try again in several seconds.'));
  }
});

bot.on('guildCreate', guild => db.insertGuild(guild.id));
bot.on('guildDelete', guild => db.removeGuild(guild.id));
