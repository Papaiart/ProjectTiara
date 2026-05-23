import { Router } from 'express';
import db from '../db.js';
import { sendFormMail } from '../utils/email.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Nyeremenyjatek / Matrica rendeles urlap beadasa
router.post('/', async (req, res) => {
  const { type = 'prize', name, email, subject = '', message = '', payload = '' } = req.body || {};
  if (!name || !email)
    return res.status(400).json({ error: 'A név és az email kötelező.' });
  if (!['prize', 'sticker'].includes(type))
    return res.status(400).json({ error: 'Érvénytelen űrlap típus.' });

  const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
  db.prepare(
    'INSERT INTO form_submissions (type, name, email, subject, message, payload) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(type, name, email, subject, message, payloadStr);

  try {
    await sendFormMail({ type, name, email, subject, message, payload: payloadStr });
  } catch (err) {
    console.error('Email kuldes hiba:', err.message);
  }

  res.status(201).json({
    ok: true,
    message: 'Megkaptam a leveled, feldolgozás alatt van. Hamarosan jelentkezem!',
  });
});

// Beerkezett urlapok listaja (admin)
router.get('/', requireAdmin, (req, res) => {
  const { type } = req.query;
  const rows = type
    ? db.prepare('SELECT * FROM form_submissions WHERE type = ? ORDER BY created_at DESC').all(type)
    : db.prepare('SELECT * FROM form_submissions ORDER BY created_at DESC').all();
  res.json(rows);
});

export default router;
