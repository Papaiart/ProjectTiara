import jwt from 'jsonwebtoken';
import db from '../db.js';

const SECRET = process.env.JWT_SECRET || 'dev-secret-valtsd-meg';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, is_admin: !!user.is_admin },
    SECRET,
    { expiresIn: '30d' }
  );
}

function readUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET);
    return db
      .prepare('SELECT id, username, email, is_admin, bio, avatar FROM users WHERE id = ?')
      .get(payload.id) || null;
  } catch {
    return null;
  }
}

// Beolvassa a usert ha be van jelentkezve, de nem kotelezo
export function optionalAuth(req, _res, next) {
  req.user = readUser(req);
  next();
}

// Bejelentkezes kotelezo
export function requireAuth(req, res, next) {
  const user = readUser(req);
  if (!user) return res.status(401).json({ error: 'Bejelentkezés szükséges.' });
  req.user = user;
  next();
}

// Admin jog kotelezo
export function requireAdmin(req, res, next) {
  const user = readUser(req);
  if (!user) return res.status(401).json({ error: 'Bejelentkezés szükséges.' });
  if (!user.is_admin) return res.status(403).json({ error: 'Csak admin számára.' });
  req.user = user;
  next();
}
