import { Link } from 'react-router-dom';
import { assetUrl } from '../api';

export default function NotFound() {
  return (
    <section className="section container center">
      <img src={assetUrl('decor/branch.svg')} alt="" style={{ margin: '0 auto 10px' }} />
      <h1>Ez az oldal nem található</h1>
      <p className="muted">Úgy tűnik, ez a lap kikerült a könyvből.</p>
      <Link to="/" className="btn btn--primary">Vissza a főoldalra</Link>
    </section>
  );
}
