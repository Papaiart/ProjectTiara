import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import './db.js';
import { optionalAuth } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import challengeRoutes from './routes/challenges.js';
import commentRoutes from './routes/comments.js';
import pollRoutes from './routes/polls.js';
import bookRoutes from './routes/books.js';
import profileRoutes from './routes/profile.js';
import formRoutes from './routes/forms.js';
import uploadRoutes from './routes/uploads.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// CORS: csak a frontend cimeirol engedunk
const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin(origin, cb) {
      // engedjuk a kozvetlen (origin nelkuli) kereseket is, pl. curl / mobil
      if (!origin || origins.includes(origin)) return cb(null, true);
      cb(new Error('CORS: nem engedélyezett forrás: ' + origin));
    },
  })
);

app.use(express.json({ limit: '2mb' }));

// Feltoltott kepek kiszolgalasa
app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

// Egeszseg-ellenorzes
app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'Tiara API' }));

// API utvonalak
app.use('/api/auth', authRoutes);
app.use('/api/challenges', optionalAuth, challengeRoutes);
app.use('/api', commentRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/books', bookRoutes);
app.use('/api', profileRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/uploads', uploadRoutes);

// Hibakezelo
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Szerver hiba.' });
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`Tiara API fut: http://localhost:${PORT}`);
});
