const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'localeyes-dev-secret-change-in-production';

/**
 * Middleware that verifies the JWT Bearer token.
 * Sets req.user = { userId, email, role } on success.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware that requires the user to have the 'authority' role.
 * Must be used after requireAuth.
 */
function requireAuthority(req, res, next) {
  if (!req.user || req.user.role !== 'authority') {
    return res.status(403).json({ error: 'Authority access required' });
  }
  next();
}

module.exports = { requireAuth, requireAuthority };
