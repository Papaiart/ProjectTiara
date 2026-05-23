import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, assetUrl } from '../api';
import { useAuth } from '../auth.jsx';
import Countdown from '../components/Countdown.jsx';
import Stars from '../components/Stars.jsx';
import CommentList from '../components/CommentList.jsx';

export default function ChallengeDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [c, setC] = useState(null);
  const [comments, setComments] = useState([]);
  const [err, setErr] = useState('');

  // teljesítés űrlap
  const [body, setBody] = useState('');
  const [moly, setMoly] = useState('');
  const [rating, setRating] = useState(0);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setErr('');
    api
      .get('/api/challenges/' + slug)
      .then((ch) => {
        setC(ch);
        return api.get(`/api/challenges/${ch.id}/comments`);
      })
      .then(setComments)
      .catch((e) => setErr(e.message));
  }, [slug]);

  async function join() {
    try {
      setC(await api.post(`/api/challenges/${c.id}/join`));
    } catch (e) {
      setErr(e.message);
    }
  }
  async function leave() {
    try {
      setC(await api.del(`/api/challenges/${c.id}/join`));
    } catch (e) {
      setErr(e.message);
    }
  }

  async function submitCompletion(e) {
    e.preventDefault();
    setSending(true);
    setErr('');
    try {
      const newComment = await api.post(`/api/challenges/${c.id}/comments`, {
        body,
        moly_link: moly,
        rating: rating || null,
      });
      setComments((cs) => [...cs, newComment]);
      setBody(''); setMoly(''); setRating(0); setDone(true);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setSending(false);
    }
  }

  if (err && !c) return <section className="section container"><p className="alert alert--error">{err}</p></section>;
  if (!c) return <div className="spinner" />;

  return (
    <section className="section container">
      <Link to="/kihivasok" className="small">&larr; Vissza a kihívásokhoz</Link>

      <div className="grid grid--2" style={{ marginTop: 16, alignItems: 'start' }}>
        <img
          src={assetUrl('challenges/' + (c.image || ''))}
          alt={c.title}
          className="card"
          onError={(e) => { e.currentTarget.src = assetUrl('books/placeholder.svg'); }}
        />
        <div>
          <div className="pill-row" style={{ marginBottom: 10 }}>
            {c.active ? <span className="tag tag--active">aktív</span> : <span className="tag tag--closed">lezárult</span>}
            <span className="tag">{c.participant_count} tag jelentkezett</span>
          </div>
          <h1 style={{ marginTop: 0 }}>{c.title}</h1>
          <p className="lead">{c.description}</p>

          {c.deadline && c.active && (
            <div style={{ margin: '18px 0' }}>
              <p className="small muted" style={{ marginBottom: 6 }}>Még ennyi időd van a teljesítésre:</p>
              <Countdown deadline={c.deadline} />
            </div>
          )}

          {/* Jelentkezem gomb */}
          {user ? (
            c.joined ? (
              <button className="btn btn--green" onClick={leave} disabled={!c.active}>
                Jelentkeztél ✓ (kilépés)
              </button>
            ) : (
              <button className="btn btn--primary" onClick={join} disabled={!c.active}>
                Jelentkezem
              </button>
            )
          ) : (
            <p className="muted">
              A jelentkezéshez <Link to="/belepes">jelentkezz be</Link>.
            </p>
          )}

          {c.badge && (
            <div style={{ marginTop: 22, display: 'flex', gap: 14, alignItems: 'center' }}>
              <img src={assetUrl('badges/' + c.badge.image)} alt={c.badge.name} style={{ width: 72 }} />
              <div>
                <strong>Megszerezhető plecsni</strong>
                <p className="small muted" style={{ margin: 0 }}>{c.badge.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Teljesítés beadása */}
      {user && c.active && (
        <div className="box" style={{ marginTop: 36 }}>
          <h3 style={{ marginTop: 0 }}>Teljesítettem! Beírom mit olvastam</h3>
          {done && <p className="alert alert--success">Köszi! A teljesítésed bekerült, hamarosan jóváhagyom.</p>}
          <form onSubmit={submitCompletion}>
            <div className="field">
              <label>Mit olvastál? (író, könyvcím, pár mondat)</label>
              <textarea className="textarea" value={body} onChange={(e) => setBody(e.target.value)} required
                placeholder="Pl. Jane Austen – Büszkeség és balítélet. Imádtam a karaktereket..." />
            </div>
            <div className="grid grid--2">
              <div className="field">
                <label>Moly.hu link (nem kötelező)</label>
                <input className="input" value={moly} onChange={(e) => setMoly(e.target.value)}
                  placeholder="https://moly.hu/..." />
              </div>
              <div className="field">
                <label>Értékelés (1–5)</label>
                <Stars value={rating} onChange={setRating} />
              </div>
            </div>
            {err && <p className="alert alert--error">{err}</p>}
            <button className="btn btn--primary" disabled={sending}>
              {sending ? 'Küldés...' : 'Teljesítés beküldése'}
            </button>
          </form>
        </div>
      )}

      {/* Hozzászólások / teljesítések */}
      <div style={{ marginTop: 40 }}>
        <h2>Teljesítések és hozzászólások ({comments.length})</h2>
        <p className="small muted">A jóváhagyott teljesítések zöld jelölést kapnak, és plecsni jár értük.</p>
        <CommentList comments={comments} setComments={setComments} />
      </div>
    </section>
  );
}
