const Discord = require('discord.js');
const { BASE_EMBED_PROPS } = require('./config');

exports.createBasicEmbed = (message) => {
  return {
    embed: new Discord.MessageEmbed({
      ...BASE_EMBED_PROPS,
      description: message
    })
  };
};

exports.authorHasPerms = (command, msg) => {
  const authorPerms = msg.channel.permissionsFor(msg.author);
  return authorPerms?.has(command.permissions);
};
