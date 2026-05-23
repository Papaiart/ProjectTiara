import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// A bejelentkezett felhasznalo konyvespolca (legujabb elol)
router.get('/', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM books WHERE user_id = ? ORDER BY created_at DESC, id DESC')
    .all(req.user.id);
  res.json(rows);
});

// Uj konyv felvetele a polcra
router.post('/', requireAuth, (req, res) => {
  const { title, author = '', image = '', review = '', rating = null } = req.body || {};
  if (!title || !String(title).trim())
    return res.status(400).json({ error: 'A könyv címe kötelező.' });
  const info = db
    .prepare(
      'INSERT INTO books (user_id, title, author, image, review, rating) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(req.user.id, String(title).trim(), author, image, review, rating || null);
  res.status(201).json(db.prepare('SELECT * FROM books WHERE id = ?').get(info.lastInsertRowid));
});

// Konyv modositasa
router.patch('/:id', requireAuth, (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book || book.user_id !== req.user.id)
    return res.status(404).json({ error: 'Nincs ilyen könyv.' });
  for (const f of ['title', 'author', 'image', 'review', 'rating']) {
    if (f in (req.body || {})) db.prepare(`UPDATE books SET ${f} = ? WHERE id = ?`).run(req.body[f], book.id);
  }
  res.json(db.prepare('SELECT * FROM books WHERE id = ?').get(book.id));
});

// Konyv torlese
router.delete('/:id', requireAuth, (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book || book.user_id !== req.user.id)
    return res.status(404).json({ error: 'Nincs ilyen könyv.' });
  db.prepare('DELETE FROM books WHERE id = ?').run(book.id);
  res.json({ ok: true });
});

export default router;
