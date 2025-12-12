const { query } = require('../../shared/db');

const DEFAULT_CONFIG = {
  mode: "observe",
  thresholds: { soft: 10, quarantine: 40, ban: 90, lockdown: 120 },
  weights: {
    joins_10s: 25, new_account: 20, name_similarity: 15,
    msg_burst: 25, mentions_rate: 20, links_rate: 20,
    bad_link: 60, perm_change_admin: 50, webhook_spike: 40
  },
  cooldowns: { message: "1/10s", link: "2/30s" },
  quarantine: { role_name: "Mute", duration_sec: 3600 },
  lockdown: { default_ttl_sec: 900 },
  allowlist: { domains: [], users: [], roles: [] },
  denylist: { domains: ["grabify.link","discordnitro.xyz"] }
};

async function ensureGuild({ id, name }) {
  await query(
    `INSERT INTO guild (id, name, config_json)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [id, name, JSON.stringify(DEFAULT_CONFIG)]
  );
}

async function getGuildConfig(guildId) {
  const r = await query(`SELECT config_json FROM guild WHERE id = ?`, [guildId]);
  if (!r.rows.length) return DEFAULT_CONFIG;
  const raw = r.rows[0].config_json;
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; }
  catch { return DEFAULT_CONFIG; }
}

async function setGuildConfig(guildId, cfg) {
  await query(`UPDATE guild SET config_json = ? WHERE id = ?`, [JSON.stringify(cfg), guildId]);
}

module.exports = { ensureGuild, getGuildConfig, setGuildConfig, DEFAULT_CONFIG };