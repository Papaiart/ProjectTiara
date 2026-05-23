import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from './db.js';

console.log('Seed adatok feltöltése...');

// --- Admin felhasználó ---
const adminEmail = process.env.ADMIN_EMAIL || 'admin@tiara.hu';
const adminUser = process.env.ADMIN_USERNAME || 'Tiara';
const adminPass = process.env.ADMIN_PASSWORD || 'tiara1234';

let admin = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
if (!admin) {
  const hash = bcrypt.hashSync(adminPass, 10);
  const info = db
    .prepare('INSERT INTO users (username, email, password_hash, is_admin, bio) VALUES (?, ?, ?, 1, ?)')
    .run(adminUser, adminEmail, hash, 'Tiara – a könyves kihívások házigazdája.');
  admin = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  console.log(`Admin létrehozva: ${adminEmail} / ${adminPass}`);
} else {
  console.log('Admin már létezik.');
}

// --- Plecsnik (jelvények) ---
const badges = [
  { slug: 'borito-bingo', name: 'Borító Bingó plecsni', image: 'borito-bingo.svg', description: 'A Borító Bingó kihívás teljesítéséért.' },
  { slug: 'matrix', name: 'Mátrix plecsni', image: 'matrix.svg', description: 'A Mátrix kihívás teljesítéséért.' },
  { slug: 'teli-maraton', name: 'Téli Maraton plecsni', image: 'teli-maraton.svg', description: 'A Téli Olvasómaraton teljesítéséért.' },
  { slug: 'elso-konyv', name: 'Első könyv plecsni', image: 'elso-konyv.svg', description: 'Az első felvett könyvért a polcon.' },
];
for (const b of badges) {
  const exists = db.prepare('SELECT id FROM badges WHERE slug = ?').get(b.slug);
  if (!exists)
    db.prepare('INSERT INTO badges (slug, name, image, description) VALUES (?, ?, ?, ?)').run(
      b.slug,
      b.name,
      b.image,
      b.description
    );
}
const badgeId = (slug) => db.prepare('SELECT id FROM badges WHERE slug = ?').get(slug)?.id;

// --- Kihívások ---
const future = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

const challenges = [
  {
    slug: 'borito-bingo',
    title: 'Borító Bingó kihívás',
    description:
      'Tölts ki egy bingó táblát olyan könyvekkel, amelyek borítója illik az adott mezőhöz: legyen rajta állat, víz, kék szín, két szereplő, régi épület, és így tovább. Aki kitölt egy sort, már teljesítette!',
    image: 'challenge-borito-bingo.svg',
    badge: 'borito-bingo',
    deadline: future(30),
  },
  {
    slug: 'matrix-kihivas',
    title: 'Mátrix Kihívás',
    description:
      'Egy 3×3-as mátrix, ahol minden sor egy témát, minden oszlop egy zsánert jelöl. Olvass úgy, hogy a kiválasztott mezők találkozzanak: pl. „női főszereplő” + „történelmi regény”.',
    image: 'challenge-matrix.svg',
    badge: 'matrix',
    deadline: future(45),
  },
  {
    slug: 'teli-olvasomaraton',
    title: 'Téli Olvasómaraton',
    description:
      'Olvass el három könyvet a téli szünet alatt. Bármilyen zsáner jöhet, a lényeg, hogy elveszd magad a történetekben egy bögre forró csoki mellett.',
    image: 'challenge-teli-maraton.svg',
    badge: 'teli-maraton',
    deadline: future(60),
  },
];
for (const c of challenges) {
  const exists = db.prepare('SELECT id FROM challenges WHERE slug = ?').get(c.slug);
  if (!exists)
    db.prepare(
      'INSERT INTO challenges (slug, title, description, image, badge_id, deadline, active) VALUES (?, ?, ?, ?, ?, ?, 1)'
    ).run(c.slug, c.title, c.description, c.image, badgeId(c.badge), c.deadline);
}

// --- Szavazás: mit olvassunk közösen? ---
const pollExists = db.prepare('SELECT id FROM polls LIMIT 1').get();
if (!pollExists) {
  const info = db.prepare('INSERT INTO polls (question, active) VALUES (?, 1)').run(
    'Mit olvassunk közösen a következő hónapban?'
  );
  const pollId = info.lastInsertRowid;
  const options = [
    { label: 'Klasszikus regény', image: 'book-1.svg' },
    { label: 'Kortárs fantasy', image: 'book-2.svg' },
    { label: 'Igaz történet / memoár', image: 'book-3.svg' },
  ];
  for (const o of options)
    db.prepare('INSERT INTO poll_options (poll_id, label, image) VALUES (?, ?, ?)').run(
      pollId,
      o.label,
      o.image
    );
}

console.log('Kész! Seed adatok feltöltve.');
