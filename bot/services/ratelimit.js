const buckets = new Map();

function key(guildId, userId, channelId, name) {
  return `${guildId}:${userId}:${channelId}:${name}`;
}

function consume({ guildId, userId, channelId, name, capacity=5, refillPerSec=1, cost=1 }) {
  const k = key(guildId, userId, channelId, name);
  const now = Date.now() / 1000;
  const b = buckets.get(k) || { tokens: capacity, last: now };
  const elapsed = Math.max(0, now - b.last);
  b.tokens = Math.min(capacity, b.tokens + elapsed * refillPerSec);
  b.last = now;

  if (b.tokens >= cost) {
    b.tokens -= cost;
    buckets.set(k, b);
    return { allowed: true, remaining: Math.floor(b.tokens) };
  } else {
    buckets.set(k, b);
    return { allowed: false, remaining: Math.floor(b.tokens) };
  }
}

module.exports = { consume };