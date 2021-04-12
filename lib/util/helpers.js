const Discord = require('discord.js');
const { BASE_EMBED_PROPS } = require('./config');

const createBasicEmbed = (message) => {
  return {
    embed: new Discord.MessageEmbed({
      ...BASE_EMBED_PROPS,
      description: message
    })
  };
};

const authorHasPerms = (command, msg) => {
  const authorPerms = msg.channel.permissionsFor(msg.author);
  return authorPerms?.has(command.permissions);
};

module.exports = {
  createBasicEmbed,
  authorHasPerms
};
