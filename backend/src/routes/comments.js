import { Router } from 'express';
import db from '../db.js';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

function decorateComment(c) {
  const user = db.prepare('SELECT username, avatar FROM users WHERE id = ?').get(c.user_id);
  return {
    ...c,
    approved: !!c.approved,
    thanked: !!c.thanked,
    username: user?.username || 'törölt',
    avatar: user?.avatar || '',
  };
}

// Egy kihivas hozzaszolasai (teljesitesei)
router.get('/challenges/:id/comments', optionalAuth, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM comments WHERE challenge_id = ? ORDER BY created_at ASC')
    .all(req.params.id);
  res.json(rows.map(decorateComment));
});

// Uj hozzaszolas / teljesites beadasa
router.post('/challenges/:id/comments', requireAuth, (req, res) => {
  const c = db.prepare('SELECT * FROM challenges WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Nincs ilyen kihívás.' });
  const { body, moly_link = '', rating = null } = req.body || {};
  if (!body || !String(body).trim())
    return res.status(400).json({ error: 'Írd le mit olvastál.' });
  const info = db
    .prepare(
      'INSERT INTO comments (challenge_id, user_id, body, moly_link, rating) VALUES (?, ?, ?, ?, ?)'
    )
    .run(c.id, req.user.id, String(body).trim(), moly_link, rating || null);
  const created = db.prepare('SELECT * FROM comments WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(decorateComment(created));
});

// Jovahagyas + plecsni kiosztas (admin "+" gomb -> zold)
router.post('/comments/:id/approve', requireAdmin, (req, res) => {
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Nincs ilyen hozzászólás.' });
  db.prepare('UPDATE comments SET approved = 1 WHERE id = ?').run(comment.id);

  // A kihivashoz tartozo plecsnit a felhasznalo profiljara tesszuk
  const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(comment.challenge_id);
  if (challenge?.badge_id) {
    try {
      db.prepare(
        'INSERT INTO user_badges (user_id, badge_id, comment_id) VALUES (?, ?, ?)'
      ).run(comment.user_id, challenge.badge_id, comment.id);
    } catch {
      /* mar megkapta ezt a plecsnit */
    }
  }
  const updated = db.prepare('SELECT * FROM comments WHERE id = ?').get(comment.id);
  res.json(decorateComment(updated));
});

// Jovahagyas visszavonasa (admin)
router.post('/comments/:id/unapprove', requireAdmin, (req, res) => {
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Nincs ilyen hozzászólás.' });
  db.prepare('UPDATE comments SET approved = 0 WHERE id = ?').run(comment.id);
  const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(comment.challenge_id);
  if (challenge?.badge_id) {
    db.prepare('DELETE FROM user_badges WHERE comment_id = ? AND badge_id = ?').run(
      comment.id,
      challenge.badge_id
    );
  }
  const updated = db.prepare('SELECT * FROM comments WHERE id = ?').get(comment.id);
  res.json(decorateComment(updated));
});

// Admin valasz a hozzaszolasra
router.post('/comments/:id/reply', requireAdmin, (req, res) => {
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Nincs ilyen hozzászólás.' });
  const { reply = '' } = req.body || {};
  db.prepare("UPDATE comments SET admin_reply = ?, admin_reply_at = datetime('now') WHERE id = ?").run(
    reply,
    comment.id
  );
  const updated = db.prepare('SELECT * FROM comments WHERE id = ?').get(comment.id);
  res.json(decorateComment(updated));
});

// "Koszonom" gomb (a hozzaszolas tulajdonosa nyomja meg -> zold)
router.post('/comments/:id/thanks', requireAuth, (req, res) => {
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Nincs ilyen hozzászólás.' });
  if (comment.user_id !== req.user.id)
    return res.status(403).json({ error: 'Csak a saját hozzászólásodnál.' });
  db.prepare('UPDATE comments SET thanked = 1 WHERE id = ?').run(comment.id);
  const updated = db.prepare('SELECT * FROM comments WHERE id = ?').get(comment.id);
  res.json(decorateComment(updated));
});

export default router;
