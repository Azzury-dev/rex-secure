const { query } = require('../../shared/db');

async function logDecision(guildId, { actor, action, target, args }) {
  try {
    await query(
      `INSERT INTO action_log (guild_id, actor, action, target, args_json)
       VALUES (?, ?, ?, ?, ?)`,
      [guildId, actor, action, target, JSON.stringify(args || {})]
    );
  } catch (e) {
    console.error('[logDecision] DB error', e);
  }
}
module.exports = { logDecision };
