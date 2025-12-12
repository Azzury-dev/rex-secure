const { ensureGuild, getGuildConfig } = require('../services/config');
const { evaluate } = require('../engine/rules');
const { logDecision } = require('../services/logs');

async function onGuildMemberAdd(client, member) {
  await ensureGuild({ id: member.guild.id, name: member.guild.name });
  const cfg = await getGuildConfig(member.guild.id);
  const signals = [];

  try {
    const created = member.user.createdAt?.getTime?.() || 0;
    const ageDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
    if (ageDays < 7) signals.push({ key: 'new_account', value: 1 });
  } catch {}

  const decision = evaluate(signals, cfg);
  await logDecision(member.guild.id, {
    actor: 'bot',
    action: 'member_add',
    target: member.user.id,
    args: { score: decision.score, reason: decision.reason }
  });
}

module.exports = { onGuildMemberAdd };