const { evaluate } = require('../engine/rules');
const { extractLinks, checkLink } = require('../engine/links');
const { getGuildConfig } = require('../services/config');
const { logDecision } = require('../services/logs');
const { applyMitigation } = require('../engine/mitigations');
const { consume } = require('../services/ratelimit');

async function onMessageCreate(client, msg) {
  if (!msg.guild || msg.author.bot) return;
  const cfg = await getGuildConfig(msg.guild.id);
  const signals = [];

  const rl = consume({
    guildId: msg.guild.id,
    userId: msg.author.id,
    channelId: msg.channel.id,
    name: 'msg',
    capacity: 5,
    refillPerSec: 0.5,
    cost: 1,
  });
  if (!rl.allowed) {
    signals.push({ key: 'msg_burst', value: 1 });
  }

  const links = extractLinks(msg.content);
  if (links.length) {
    const linkRl = consume({
      guildId: msg.guild.id,
      userId: msg.author.id,
      channelId: msg.channel.id,
      name: 'link',
      capacity: 2,
      refillPerSec: 1/30,
      cost: links.length,
    });
    if (!linkRl.allowed) signals.push({ key: 'links_rate', value: 1 });

    for (const url of links) {
      const rep = await checkLink(url, cfg);
      if (rep.suspicious) signals.push({ key: 'bad_link', value: 1 });
    }
  }

  const decision = evaluate(signals, cfg);
  await applyMitigation(client, msg, decision, cfg);
  await logDecision(msg.guild.id, {
    actor: 'bot',
    action: decision.level,
    target: msg.author.id,
    args: { score: decision.score, reason: decision.reason, messageId: msg.id }
  });
}
module.exports = { onMessageCreate };
