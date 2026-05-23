import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div style={{ maxWidth: 280 }}>
            <h4>Tiara</h4>
            <p className="small">
              Könyves kihívások, plecsni gyűjtemény és közös olvasás könyvmolyoknak. Olvass,
              teljesíts, gyűjts és nyerj!
            </p>
          </div>
          <div>
            <h4>Oldalak</h4>
            <p className="small"><Link to="/">Főoldal</Link></p>
            <p className="small"><Link to="/kihivasok">Kihívások</Link></p>
            <p className="small"><Link to="/nyeremenyjatek">Nyereményjáték</Link></p>
            <p className="small"><Link to="/matrica-rendeles">Matrica rendelés</Link></p>
          </div>
          <div>
            <h4>Kapcsolat</h4>
            <p className="small">
              Email: <a href="mailto:hello@tiara.hu">hello@tiara.hu</a>
            </p>
            <p className="small">
              Könyvkeresés: <a href="https://moly.hu" target="_blank" rel="noreferrer">moly.hu</a>
            </p>
          </div>
        </div>
        <div className="footer__bottom">
          &copy; {new Date().getFullYear()} Tiara. Minden jog fenntartva. &middot; Az adatok
          kezeléséről az adatvédelmi tájékoztatónkban olvashatsz.
        </div>
      </div>
    </footer>
  );
}
