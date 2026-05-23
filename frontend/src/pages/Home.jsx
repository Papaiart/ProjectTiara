import { useState } from 'react';
import { Link } from 'react-router-dom';
import { assetUrl } from '../api';
import VoteWidget from '../components/VoteWidget.jsx';

const STEPS = [
  {
    title: 'Kihívás választása',
    text: 'Válaszd ki a kedvenc könyvkihívásodat a kínálatból. Minden kihívás egyedi célkitűzés. Olvass, és ha kész vagy, kattints a teljesítés gombra!',
  },
  {
    title: 'Oszd meg, mit olvastál',
    text: 'A hozzászólásnál beillesztheted a moly.hu „én és a könyv” linkedet, vagy egyszerűen leírod: író, könyvcím és hány csillagot adnál (1–5).',
  },
  {
    title: 'Plecsni kiosztása',
    text: 'Manuálisan ellenőrzöm a teljesítést, majd a hozzászólásod jóváhagyásával a profilodra kerül a kihíváshoz járó virtuális plecsni.',
  },
];

export default function Home() {
  const [molyQuery, setMolyQuery] = useState('');

  function molySearch(e) {
    e.preventDefault();
    const url = molyQuery.trim()
      ? 'https://moly.hu/kereses?q=' + encodeURIComponent(molyQuery.trim())
      : 'https://moly.hu';
    window.open(url, '_blank', 'noopener');
  }

  return (
    <>
      {/* Futó hírsáv (reklám / közlemény) */}
      <div className="marquee">
        <span>
          ✦ Felkészültél az olvasásra? &nbsp; Csatlakozz az aktuális kihívásokhoz! &nbsp; ✦ &nbsp;
          Gyűjtsd össze a plecsniket és nyerj könyvmoly cuccokat! &nbsp; ✦
        </span>
      </div>

      {/* Hero */}
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <h1>Felkészültél az olvasásra?</h1>
            <p className="hero__lead">
              <strong>Játssz és nyerj!</strong> Gyűjtsd össze a plecsniket, és nyerj könyvmoly
              cuccokat vagy akár egy könyvet. Csatlakozz a Tiara olvasó közösségéhez!
            </p>
            <div className="hero__cta">
              <Link to="/kihivasok" className="btn btn--primary">Kihívások felfedezése</Link>
              <Link to="/regisztracio" className="btn btn--outline">Regisztráció</Link>
            </div>
          </div>
          <div className="hero__art">
            <img src={assetUrl('decor/hero.svg')} alt="Olvasó illusztráció" />
          </div>
        </div>
      </section>

      {/* Hónap ajánlata */}
      <section className="section container">
        <h2 className="section-title">A hónap ajánlata</h2>
        <img className="divider-img" src={assetUrl('decor/divider.svg')} alt="" />
        <div className="box" style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
          <img src={assetUrl('books/featured.svg')} alt="A hónap könyve" style={{ width: 160 }} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <h3 style={{ marginTop: 0 }}>A hónap könyve</h3>
            <p className="lead">
              Minden hónapban kiválasztok egy könyvet, amit közösen olvasunk el. Nézd meg az
              aktuális ajánlót, és csatlakozz a beszélgetéshez a kihívások oldalán!
            </p>
            <Link to="/kihivasok" className="btn btn--outline">Megnézem a kihívásokat</Link>
          </div>
        </div>
      </section>

      {/* Hogyan működik – 3 lépés */}
      <section className="section" style={{ background: 'var(--cream-2)' }}>
        <div className="container">
          <h2 className="section-title">Hogyan működik?</h2>
          <img className="divider-img" src={assetUrl('decor/divider.svg')} alt="" />
          <div className="grid grid--3 steps">
            {STEPS.map((s, i) => (
              <div className="card" key={i}>
                <div className="card__body">
                  <div className="step__num">{i + 1}</div>
                  <h3 style={{ marginTop: 0 }}>{s.title}</h3>
                  <p className="muted">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Moly.hu kereső */}
      <section className="section container">
        <div className="box center">
          <h2 style={{ marginTop: 0 }}>Könyv keresése a moly.hu-n</h2>
          <p className="muted">
            Itt tudsz könyveket keresni a kihívásaidhoz: címke, zsáner, borító, oldalszám vagy
            értékelés szerint.
          </p>
          <form onSubmit={molySearch} className="pill-row" style={{ justifyContent: 'center', maxWidth: 480, margin: '0 auto' }}>
            <input
              className="input"
              placeholder="Pl. könyvcím vagy író..."
              value={molyQuery}
              onChange={(e) => setMolyQuery(e.target.value)}
              style={{ flex: 1, minWidth: 180 }}
            />
            <button className="btn btn--primary" type="submit">Keresés</button>
          </form>
        </div>
      </section>

      {/* Szavazás */}
      <section className="section" style={{ background: 'var(--cream-2)' }}>
        <div className="container">
          <h2 className="section-title">Válaszd, mit olvassunk közösen!</h2>
          <img className="divider-img" src={assetUrl('decor/divider.svg')} alt="" />
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <VoteWidget />
          </div>
        </div>
      </section>

      {/* App letöltés + Támogatás */}
      <section className="section container">
        <div className="grid grid--2">
          <div className="box" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <img src={assetUrl('decor/mobile-app.svg')} alt="Mobil app" style={{ width: 120 }} />
            <div>
              <h3 style={{ marginTop: 0 }}>Töltsd le az appot</h3>
              <p className="muted">Az oldal mobilbarát, így telefonról is kényelmesen olvashatod és követheted a kihívásaidat.</p>
              <button className="btn btn--outline btn--sm" onClick={() => alert('Az alkalmazás hamarosan elérhető lesz!')}>
                Hamarosan
              </button>
            </div>
          </div>
          <div className="box" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <img src={assetUrl('badges/elso-konyv.svg')} alt="" style={{ width: 96 }} />
            <div>
              <h3 style={{ marginTop: 0 }}>Támogasd az oldalt</h3>
              <p className="muted">Ha van kedved támogatni a munkám, itt megteheted. Minden támogatás a közösséget szolgálja!</p>
              <a className="btn btn--rose btn--sm" href="https://ko-fi.com" target="_blank" rel="noreferrer">
                Támogatom ❤
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Elérhetőség */}
      <section className="section--tight container center">
        <h2>Elérhetőség</h2>
        <p className="muted">Kérdésed van? Írj bármikor!</p>
        <a className="btn btn--primary" href="mailto:hello@tiara.hu">Email küldése</a>
      </section>
    </>
  );
}
