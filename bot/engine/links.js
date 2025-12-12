const punycode = require('punycode/');
const { URL } = require('url');

function extractLinks(text) {
  const r = /https?:\/\/[^\s)]+/g;
  return text?.match(r) || [];
}

function normalizeHost(host) {
  try { return punycode.toASCII(String(host).toLowerCase()); } catch { return String(host || '').toLowerCase(); }
}

async function checkLink(urlStr, cfg) {
  let host = ''; let suspicious = false;
  try { host = normalizeHost(new URL(urlStr).host); } catch { /* ignore parse error */ }
  const deny = new Set([...(cfg?.denylist?.domains || [])]);
  if (deny.has(host)) suspicious = true;
  return { host, suspicious };
}

module.exports = { extractLinks, checkLink, normalizeHost };