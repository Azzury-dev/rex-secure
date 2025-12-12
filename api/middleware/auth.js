const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const token = req.cookies?.session || req.headers['x-session'];
  if (!token) return res.status(401).json({ error: 'auth_required' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'invalid_session' });
  }
}

module.exports = { requireAuth };
