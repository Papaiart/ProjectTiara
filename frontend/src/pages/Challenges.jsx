import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, assetUrl } from '../api';

export default function Challenges() {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/api/challenges').then(setItems).catch((e) => setErr(e.message));
  }, []);

  return (
    <section className="section container">
      <h1 className="section-title">Kihívások</h1>
      <p className="section-sub">
        Válaszd ki, melyik kihívásba vágsz bele! Minden teljesített kihívásért egyedi plecsni jár a
        profilodra.
      </p>

      {err && <p className="alert alert--error">{err}</p>}
      {!items && !err && <div className="spinner" />}

      {items && (
        <div className="grid grid--3">
          {items.map((c) => (
            <div className="card" key={c.id}>
              <img
                className="challenge-card__img"
                src={assetUrl('challenges/' + (c.image || ''))}
                alt={c.title}
                onError={(e) => { e.currentTarget.src = assetUrl('books/placeholder.svg'); }}
              />
              <div className="card__body">
                <div className="pill-row" style={{ marginBottom: 8 }}>
                  {c.active ? (
                    <span className="tag tag--active">aktív</span>
                  ) : (
                    <span className="tag tag--closed">lezárult</span>
                  )}
                  <span className="tag">{c.participant_count} résztvevő</span>
                </div>
                <h3 style={{ margin: '0 0 8px' }}>{c.title}</h3>
                <p className="muted small" style={{ minHeight: 60 }}>
                  {c.description.slice(0, 120)}
                  {c.description.length > 120 ? '…' : ''}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  {c.badge && (
                    <img className="challenge-card__badge" src={assetUrl('badges/' + c.badge.image)} alt={c.badge.name} title={c.badge.name} />
                  )}
                  <Link to={'/kihivas/' + c.slug} className="btn btn--primary btn--sm" style={{ marginLeft: 'auto' }}>
                    Megnézem
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="empty">Még nincs kihívás. Nézz vissza hamarosan!</p>}
        </div>
      )}
    </section>
  );
}
