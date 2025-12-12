const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const router = express.Router();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

const pendingStates = new Map();
function rememberState(state) {
  const ttl = Date.now() + 10 * 60 * 1000;
  pendingStates.set(state, ttl);
}
function useStateIfValid(state) {
  const ttl = pendingStates.get(state);
  if (!ttl) return false;
  const ok = ttl >= Date.now();
  pendingStates.delete(state);
  return ok;
}

function setStateCookie(res, val) {
  res.cookie('oauth_state', val, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // en prod -> true + HTTPS
    path: '/',
    maxAge: 10 * 60 * 1000
  });
}

router.get('/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  rememberState(state);
  setStateCookie(res, state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'identify',
    state
  });
  return res.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
});

router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) return res.status(400).send('Missing code/state');

    const stateCookie = req.cookies?.oauth_state;
    const cookieOK = !!stateCookie && stateCookie === state;

    const memoryOK = useStateIfValid(state);

    if (!cookieOK && !memoryOK) {
      console.warn('[oauth] invalid state', { state, stateCookie, cookieOK, memoryOK });
      return res.status(400).send('Invalid state');
    }

    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      })
    });
    if (!tokenRes.ok) {
      const t = await tokenRes.text();
      console.error('[oauth] token error:', t);
      return res.status(400).send('Token exchange failed');
    }
    const token = await tokenRes.json();

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `${token.token_type} ${token.access_token}` }
    });
    if (!userRes.ok) {
      const t = await userRes.text();
      console.error('[oauth] user error:', t);
      return res.status(400).send('User fetch failed');
    }
    const user = await userRes.json();

    const session = jwt.sign(
      { sub: user.id, username: user.username, provider: 'discord' },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.clearCookie('oauth_state');
    res.cookie('session', session, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 2 * 60 * 60 * 1000
    });

    return res.redirect(`${FRONTEND_URL}/guilds`);
  } catch (e) {
    console.error('[oauth] callback err:', e);
    return res.status(500).send('OAuth callback error');
  }
});

module.exports = router;