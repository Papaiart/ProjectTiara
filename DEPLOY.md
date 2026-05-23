# Élesítési útmutató — Tiara

Ez a leírás végigvezet, hogyan teszed közzé az oldalt az interneten. Két dolgot állítunk be:

1. **Backend** egy szerveren (Google Cloud VM vagy más VPS) — HTTPS-sel.
2. **Frontend** a GitHub Pages-en — automatikusan, GitHub Actionnel.

A sorrend fontos: **először a backend** (mert kell a címe a frontendhez), **utána a frontend**.

---

## A. Backend egy szerverre (Google Cloud VM)

### A.1 Virtuális gép létrehozása

1. Lépj be a Google Cloud Console-ba: https://console.cloud.google.com
2. **Compute Engine → VM instances → Create instance**.
3. Válassz egy kis gépet (pl. `e2-small`), régiónak egy európait (pl. `europe-west`).
4. Operációs rendszer: **Ubuntu 24.04 LTS**.
5. A tűzfalnál pipáld be: **Allow HTTP traffic** és **Allow HTTPS traffic**.
6. Hozd létre, majd csatlakozz hozzá az **SSH** gombbal.

> Bármilyen más VPS (pl. Hetzner, DigitalOcean) ugyanígy működik — kell egy Ubuntu szerver és
> SSH hozzáférés.

### A.2 Egy (al)domain beállítása

Ahhoz, hogy HTTPS legyen, kell egy domain. Pl. ha van `tiara-oldalad.hu` domained, hozz létre egy
`api.tiara-oldalad.hu` **A rekordot**, ami a szerver IP-címére mutat (a VM külső IP-jét a Cloud
Console-ban látod).

### A.3 Node.js és eszközök telepítése

A szerveren (SSH-ban) futtasd:

```bash
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git nginx
```

### A.4 A kód letöltése és a backend beállítása

```bash
# hozz létre egy felhasznalot a futtatashoz
sudo adduser --disabled-password --gecos "" tiara
sudo su - tiara

git clone <A-TE-GITHUB-REPOD-CIME> book-badges
cd book-badges/backend
npm install --omit=dev
cp .env.example .env
nano .env          # töltsd ki! (lásd lentebb)
npm run seed       # kezdő adatok feltöltése
exit               # vissza a sajat felhasznalodra
```

A `.env` fájlban mindenképp állítsd be:

```
PORT=4000
JWT_SECRET=<egy-hosszu-veletlen-szoveg>
CORS_ORIGIN=https://FELHASZNALONEVED.github.io
PUBLIC_URL=https://api.tiara-oldalad.hu
ADMIN_EMAIL=...        ADMIN_PASSWORD=...        ADMIN_USERNAME=Tiara
# E-mailhez (nyereményjáték/matrica űrlapok), pl. Gmail vagy a domain SMTP-je:
SMTP_HOST=...  SMTP_PORT=587  SMTP_USER=...  SMTP_PASS=...
MAIL_TO=<a-te-emailed>   MAIL_FROM=<ahonnan-megy>
```

> A `CORS_ORIGIN` a frontend címe. Több cím vesszővel elválasztva is megadható.
> Az `ADMIN_*` mezők hozzák létre az első admin felhasználót (a `npm run seed` futtatáskor).

### A.5 A backend futtatása szolgáltatásként (systemd)

```bash
sudo cp /home/tiara/book-badges/backend/deploy/tiara-backend.service /etc/systemd/system/
# ellenorizd benne a User es WorkingDirectory ertekeket!
sudo systemctl daemon-reload
sudo systemctl enable --now tiara-backend
sudo systemctl status tiara-backend      # fut-e?
```

Így a backend a háttérben fut, és újraindulás után is automatikusan elindul.

### A.6 Nginx + HTTPS

```bash
sudo cp /home/tiara/book-badges/backend/deploy/nginx-tiara.conf /etc/nginx/sites-available/tiara
sudo nano /etc/nginx/sites-available/tiara      # ird at a server_name-t a domainedre
sudo ln -s /etc/nginx/sites-available/tiara /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Ingyenes HTTPS tanusitvany:
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.tiara-oldalad.hu
```

Ezután a backend elérhető lesz a `https://api.tiara-oldalad.hu` címen.
Próbáld ki a böngészőben: `https://api.tiara-oldalad.hu/api/health` → `{"ok":true,...}`.

### Frissítés később (új verzió telepítése)

```bash
sudo su - tiara
cd book-badges && git pull
cd backend && npm install --omit=dev
exit
sudo systemctl restart tiara-backend
```

---

## B. Frontend a GitHub Pages-re

### B.1 A kód feltöltése GitHubra

Hozz létre egy repót a GitHubon (pl. `book-badges`), és töltsd fel ezt a projektet:

```bash
cd "book badges"
git init
git add .
git commit -m "Tiara oldal"
git branch -M main
git remote add origin https://github.com/FELHASZNALONEVED/book-badges.git
git push -u origin main
```

### B.2 A backend címének beállítása

A GitHub repóban: **Settings → Secrets and variables → Actions → Variables fül → New variable**

- Név: `VITE_API_URL`
- Érték: `https://api.tiara-oldalad.hu` (a backended címe HTTPS-sel, `/` nélkül a végén)

### B.3 GitHub Pages bekapcsolása

**Settings → Pages → Build and deployment → Source: GitHub Actions**.

Ezután minden `main` ágra történő push automatikusan újraépíti és kiteszi a frontendet. A cím:

```
https://FELHASZNALONEVED.github.io/book-badges/
```

(A `book-badges` a repó neve — a beépítés automatikusan ezt használja `base`-ként.)

> Ha átírod a repó nevét, a `CORS_ORIGIN`-t a backend `.env`-jében is frissítsd, majd
> `sudo systemctl restart tiara-backend`.

---

## C. Ellenőrző lista élesítés után

- [ ] `https://api.tiara-oldalad.hu/api/health` válaszol böngészőben
- [ ] A frontend megnyílik a github.io címen
- [ ] Be tudsz lépni az admin fiókkal
- [ ] A kihívások és a szavazás betöltődnek (azaz a frontend eléri a backendet)
- [ ] Egy teszt regisztráció + kihívás teljesítés + admin jóváhagyás működik
- [ ] Egy teszt könyv feltöltése a profilon (kép is) működik

Ha a frontend „nem éri el a szervert” hibát ír: nézd meg, hogy a backend HTTPS-en fut-e, és hogy a
`CORS_ORIGIN` pontosan a github.io címedet tartalmazza-e.

---

## Megjegyzés az adatbázisról

A backend **SQLite**-ot használ: az adatok egyetlen fájlban vannak (`backend/data/app.db`).
Mentés = ezt a fájlt lemásolod. Ha később nagyobb forgalom lenne, viszonylag könnyen átállítható
PostgreSQL-re. A `backend/data/` és `backend/uploads/` mappákat érdemes rendszeresen menteni
(ez utóbbiban vannak a feltöltött könyvborítók).
