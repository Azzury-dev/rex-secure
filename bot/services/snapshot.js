const { query } = require('../../shared/db');

async function createSnapshot(guildId, scope='all', payload={}, by_user='bot') {
  await query(
    `INSERT INTO snapshot (guild_id, scope, payload_json, by_user)
     VALUES (?, ?, ?, ?)`,
    [guildId, scope, JSON.stringify(payload), by_user]
  );
  return { ok: true };
}

async function listSnapshots(guildId) {
  const r = await query(
    `SELECT id, scope, created_at, by_user
     FROM snapshot WHERE guild_id = ? ORDER BY id DESC`,
    [guildId]
  );
  return r.rows;
}

async function restoreSnapshot() { return { ok:false, note:'Not implemented in MVP' }; }

module.exports = { createSnapshot, listSnapshots, restoreSnapshot };
