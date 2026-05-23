import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Osszes plecsni dizajn (a katalogushoz / admin valasztashoz)
router.get('/badges', (_req, res) => {
  res.json(db.prepare('SELECT * FROM badges ORDER BY id').all());
});

// Nyilvanos profil: plecsni gyujtemeny + konyvespolc
router.get('/users/:username', (req, res) => {
  const user = db
    .prepare('SELECT id, username, bio, avatar, created_at FROM users WHERE username = ?')
    .get(req.params.username);
  if (!user) return res.status(404).json({ error: 'Nincs ilyen felhasználó.' });

  const badges = db
    .prepare(
      `SELECT b.slug, b.name, b.image, ub.awarded_at
       FROM user_badges ub JOIN badges b ON b.id = ub.badge_id
       WHERE ub.user_id = ? ORDER BY ub.awarded_at DESC`
    )
    .all(user.id);

  const books = db
    .prepare('SELECT * FROM books WHERE user_id = ? ORDER BY created_at DESC, id DESC')
    .all(user.id);

  res.json({ user, badges, books });
});

// A sajat profilom modositasa (bemutatkozas, avatar)
router.patch('/me/profile', requireAuth, (req, res) => {
  for (const f of ['bio', 'avatar']) {
    if (f in (req.body || {})) db.prepare(`UPDATE users SET ${f} = ? WHERE id = ?`).run(req.body[f], req.user.id);
  }
  const user = db
    .prepare('SELECT id, username, email, is_admin, bio, avatar FROM users WHERE id = ?')
    .get(req.user.id);
  res.json({ user: { ...user, is_admin: !!user.is_admin } });
});

export default router;
