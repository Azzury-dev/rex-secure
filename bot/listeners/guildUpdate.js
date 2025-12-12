const { logDecision } = require('../services/logs');

async function onGuildUpdate(client, oldGuild, newGuild) {
  if (oldGuild?.name !== newGuild?.name) {
    await logDecision(newGuild.id, {
      actor: 'bot',
      action: 'guild_update',
      target: 'server',
      args: { oldName: oldGuild?.name, newName: newGuild?.name }
    });
  }
}

module.exports = { onGuildUpdate };
