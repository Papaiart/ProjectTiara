import { Router } from 'express';
import db from '../db.js';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'kihivas';
}

function decorate(challenge, userId) {
  const count = db
    .prepare('SELECT COUNT(*) AS c FROM participants WHERE challenge_id = ?')
    .get(challenge.id).c;
  const badge = challenge.badge_id
    ? db.prepare('SELECT slug, name, image FROM badges WHERE id = ?').get(challenge.badge_id)
    : null;
  let joined = false;
  if (userId) {
    joined = !!db
      .prepare('SELECT 1 FROM participants WHERE challenge_id = ? AND user_id = ?')
      .get(challenge.id, userId);
  }
  return { ...challenge, active: !!challenge.active, participant_count: count, badge, joined };
}

// Lista
router.get('/', optionalAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM challenges ORDER BY active DESC, created_at DESC').all();
  res.json(rows.map((c) => decorate(c, req.user?.id)));
});

// Reszletek slug alapjan
router.get('/:slug', optionalAuth, (req, res) => {
  const c = db.prepare('SELECT * FROM challenges WHERE slug = ?').get(req.params.slug);
  if (!c) return res.status(404).json({ error: 'Nincs ilyen kihívás.' });
  res.json(decorate(c, req.user?.id));
});

// Csatlakozas (Jelentkezem)
router.post('/:id/join', requireAuth, (req, res) => {
  const c = db.prepare('SELECT * FROM challenges WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Nincs ilyen kihívás.' });
  if (!c.active) return res.status(400).json({ error: 'Ez a kihívás már lezárult.' });
  try {
    db.prepare('INSERT INTO participants (challenge_id, user_id) VALUES (?, ?)').run(
      c.id,
      req.user.id
    );
  } catch {
    /* mar jelentkezett - rendben */
  }
  res.json(decorate(c, req.user.id));
});

// Kilepes a kihivasbol
router.delete('/:id/join', requireAuth, (req, res) => {
  db.prepare('DELETE FROM participants WHERE challenge_id = ? AND user_id = ?').run(
    req.params.id,
    req.user.id
  );
  const c = db.prepare('SELECT * FROM challenges WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Nincs ilyen kihívás.' });
  res.json(decorate(c, req.user.id));
});

// Letrehozas (admin)
router.post('/', requireAdmin, (req, res) => {
  const { title, description = '', image = '', badge_id = null, deadline = null } = req.body || {};
  if (!title) return res.status(400).json({ error: 'A cím kötelező.' });
  let slug = slugify(title);
  if (db.prepare('SELECT 1 FROM challenges WHERE slug = ?').get(slug)) slug += '-' + Date.now();
  const info = db
    .prepare(
      'INSERT INTO challenges (slug, title, description, image, badge_id, deadline) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(slug, title, description, image, badge_id || null, deadline || null);
  const c = db.prepare('SELECT * FROM challenges WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(decorate(c, req.user.id));
});

// Modositas / inaktivalas (admin)
router.patch('/:id', requireAdmin, (req, res) => {
  const c = db.prepare('SELECT * FROM challenges WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Nincs ilyen kihívás.' });
  const fields = ['title', 'description', 'image', 'badge_id', 'deadline', 'active'];
  for (const f of fields) {
    if (f in (req.body || {})) {
      db.prepare(`UPDATE challenges SET ${f} = ? WHERE id = ?`).run(req.body[f], c.id);
    }
  }
  const updated = db.prepare('SELECT * FROM challenges WHERE id = ?').get(c.id);
  res.json(decorate(updated, req.user.id));
});

export default router;
