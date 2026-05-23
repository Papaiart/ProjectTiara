import { Router } from 'express';
import db from '../db.js';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

function decoratePoll(poll, userId) {
  const options = db.prepare('SELECT * FROM poll_options WHERE poll_id = ?').all(poll.id);
  const counts = options.map(
    (o) => db.prepare('SELECT COUNT(*) AS c FROM poll_votes WHERE option_id = ?').get(o.id).c
  );
  const total = counts.reduce((a, b) => a + b, 0);
  let myOption = null;
  if (userId) {
    const v = db
      .prepare('SELECT option_id FROM poll_votes WHERE poll_id = ? AND user_id = ?')
      .get(poll.id, userId);
    myOption = v?.option_id ?? null;
  }
  return {
    ...poll,
    active: !!poll.active,
    total_votes: total,
    my_option: myOption,
    options: options.map((o, i) => ({
      ...o,
      votes: counts[i],
      percent: total ? Math.round((counts[i] / total) * 100) : 0,
    })),
  };
}

// Aktiv szavazasok
router.get('/active', optionalAuth, (req, res) => {
  const polls = db.prepare('SELECT * FROM polls WHERE active = 1 ORDER BY created_at DESC').all();
  res.json(polls.map((p) => decoratePoll(p, req.user?.id)));
});

// Szavazas leadasa
router.post('/:id/vote', requireAuth, (req, res) => {
  const poll = db.prepare('SELECT * FROM polls WHERE id = ?').get(req.params.id);
  if (!poll || !poll.active) return res.status(404).json({ error: 'Nincs aktív szavazás.' });
  const { optionId } = req.body || {};
  const option = db
    .prepare('SELECT * FROM poll_options WHERE id = ? AND poll_id = ?')
    .get(optionId, poll.id);
  if (!option) return res.status(400).json({ error: 'Érvénytelen választás.' });

  const existing = db
    .prepare('SELECT * FROM poll_votes WHERE poll_id = ? AND user_id = ?')
    .get(poll.id, req.user.id);
  if (existing) {
    db.prepare('UPDATE poll_votes SET option_id = ? WHERE id = ?').run(option.id, existing.id);
  } else {
    db.prepare('INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES (?, ?, ?)').run(
      poll.id,
      option.id,
      req.user.id
    );
  }
  res.json(decoratePoll(poll, req.user.id));
});

// Uj szavazas (admin)
router.post('/', requireAdmin, (req, res) => {
  const { question, options = [] } = req.body || {};
  if (!question || options.length < 2)
    return res.status(400).json({ error: 'Kérdés és legalább 2 opció kell.' });
  const info = db.prepare('INSERT INTO polls (question) VALUES (?)').run(question);
  const pollId = info.lastInsertRowid;
  for (const opt of options) {
    db.prepare('INSERT INTO poll_options (poll_id, label, image) VALUES (?, ?, ?)').run(
      pollId,
      typeof opt === 'string' ? opt : opt.label,
      typeof opt === 'string' ? '' : opt.image || ''
    );
  }
  const poll = db.prepare('SELECT * FROM polls WHERE id = ?').get(pollId);
  res.status(201).json(decoratePoll(poll, req.user.id));
});

export default router;
