function evaluate(signals, cfg) {
  let score = 0; const reasons = [];
  const weights = cfg?.weights || {};
  const t = cfg?.thresholds || { soft: 30, quarantine: 60, ban: 90, lockdown: 120 };

  for (const s of signals) {
    const w = Number(weights[s.key] ?? 0);
    score += w * Number(s.value ?? 1);
    reasons.push(s.key);
  }

  let level = 'log';
  if (score >= t.lockdown) level = 'lockdown';
  else if (score >= t.ban) level = 'ban';
  else if (score >= t.quarantine) level = 'quarantine';
  else if (score >= t.soft) level = 'soft';

  return { level, score, reason: reasons.join(',') };
}

module.exports = { evaluate };