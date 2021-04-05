module.exports = function authorHasPerms(command, msg) {
  const authorPerms = msg.channel.permissionsFor(msg.author);
  return authorPerms?.has(command.permissions);
};
