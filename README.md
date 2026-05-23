# Tiara — Könyves kihívás oldal

Könyvmolyoknak szóló közösségi oldal: olvasási kihívások, virtuális plecsni (jelvény)
gyűjtemény, könyvespolc / olvasónapló, közös olvasás szavazás, nyereményjáték és matrica
rendelés űrlapok.

Az oldal **két részből** áll:

- **`frontend/`** — a látható weboldal (React + Vite). Ez fut a **GitHub Pages**-en.
- **`backend/`** — az API és az adatbázis (Node.js + Express + SQLite). Ez fut egy **szerveren**
  (VPS / Google Cloud).

A kettő külön él, és az interneten keresztül beszél egymással.

---

## Mit tud az oldal?

| Oldal | Funkció |
|-------|---------|
| **Főoldal** | Hero, hónap ajánlata, 3 lépéses útmutató, moly.hu kereső, közös olvasás szavazás, app/támogatás, elérhetőség |
| **Kihívások** | Kihívások listája → részletek oldal: „Jelentkezem” gomb, résztvevő-számláló, visszaszámláló a határidőig, megszerezhető plecsni |
| **Kihívás teljesítése** | A tag beírja mit olvasott (+ moly.hu link, csillagos értékelés). Admin „+” gombbal jóváhagyja → a plecsni a tag profiljára kerül |
| **Nyereményjáték / Matrica rendelés** | Űrlapok, amelyek e-mailben érkeznek hozzád, automata visszajelzéssel |
| **Profil** | Plecsni gyűjtemény (lebegő érmek), könyvespolc rácsban, lapozással, legújabb elöl, kép + szöveges értékelés |
| **Admin** | Kihívás létrehozás/inaktiválás, szavazás létrehozás, beérkezett űrlapok megtekintése, teljesítések jóváhagyása |

A képek (logó, plecsnik, kihívás illusztrációk, könyvborítók, díszítések) saját **SVG grafikák**,
a `frontend/public/` mappában találhatók. Bármikor lecserélhetők.

---

## 1. Helyi futtatás (a saját gépeden)

Szükséges: **Node.js 22 vagy újabb** (telepítés: https://nodejs.org).

### Backend indítása

```bash
cd backend
npm install
copy .env.example .env      # Windows-on (Mac/Linux: cp .env.example .env)
npm run seed                # feltölti a kezdő adatokat (admin, kihívások, plecsnik)
npm start
```

A backend ezután a `http://localhost:4000` címen fut.
Az alapértelmezett admin belépés (a `.env`-ben átírható):
**admin@tiara.hu / tiara1234**

### Frontend indítása (másik terminálban)

```bash
cd frontend
npm install
copy .env.example .env      # Windows-on (Mac/Linux: cp .env.example .env)
npm run dev
```

A frontend ezután a `http://localhost:5173` címen nyílik meg.

---

## 2. Élesítés (közzététel az interneten)

A részletes, lépésről lépésre útmutató: **[DEPLOY.md](DEPLOY.md)**.

Röviden:

1. **Backend** egy szerverre (Google Cloud VM vagy bármilyen VPS), HTTPS-sel.
2. **Frontend** a GitHub Pages-re — ez a `.github/workflows/deploy-frontend.yml` segítségével
   automatikusan megtörténik, amikor a kódot felteszed GitHubra.

> **Fontos:** a GitHub Pages HTTPS-en fut, ezért a backendednek **is HTTPS-en** kell elérhetőnek
> lennie, különben a böngésző letiltja a kommunikációt. A DEPLOY.md leírja, hogyan kapsz ingyenes
> HTTPS tanúsítványt.

---

## Projekt felépítése

```
book badges/
├─ frontend/              React + Vite weboldal (GitHub Pages)
│  ├─ public/             képek: brand/, badges/, challenges/, books/, decor/
│  └─ src/
│     ├─ pages/           az egyes oldalak
│     ├─ components/      újrahasznosított elemek (Navbar, BookCard, ...)
│     ├─ api.js           a backend hívása
│     └─ auth.jsx         bejelentkezés kezelése
├─ backend/               Node + Express + SQLite API (szerver)
│  ├─ src/
│  │  ├─ server.js        a szerver belépési pontja
│  │  ├─ db.js            adatbázis séma
│  │  ├─ seed.js          kezdő adatok
│  │  └─ routes/          API végpontok
│  └─ deploy/             minta systemd + nginx beállítások
├─ .github/workflows/     automatikus frontend-telepítés
└─ DEPLOY.md              élesítési útmutató
```

A specifikáció a 4 Word dokumentumból készült (Főoldal, Kihívások, Nyereményjáték és Matrica
rendelés, Profil oldal).
