import { useEffect, useState } from 'react';
import { api } from '../api';

function fmt(s) {
  return s ? new Date(s.replace(' ', 'T')).toLocaleString('hu-HU') : '';
}

export default function Admin() {
  const [tab, setTab] = useState('challenges');
  return (
    <section className="section container">
      <h1 style={{ marginTop: 0 }}>Admin felület</h1>
      <div className="pill-row" style={{ marginBottom: 24 }}>
        <button className={'btn btn--sm ' + (tab === 'challenges' ? 'btn--primary' : 'btn--ghost')} onClick={() => setTab('challenges')}>Kihívások</button>
        <button className={'btn btn--sm ' + (tab === 'polls' ? 'btn--primary' : 'btn--ghost')} onClick={() => setTab('polls')}>Szavazás</button>
        <button className={'btn btn--sm ' + (tab === 'forms' ? 'btn--primary' : 'btn--ghost')} onClick={() => setTab('forms')}>Beérkezett űrlapok</button>
      </div>
      {tab === 'challenges' && <ChallengesAdmin />}
      {tab === 'polls' && <PollsAdmin />}
      {tab === 'forms' && <FormsAdmin />}
    </section>
  );
}

function ChallengesAdmin() {
  const [list, setList] = useState([]);
  const [badges, setBadges] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', image: '', badge_id: '', deadline: '' });
  const [msg, setMsg] = useState('');

  function load() {
    api.get('/api/challenges').then(setList);
    api.get('/api/badges').then(setBadges);
  }
  useEffect(load, []);

  async function create(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/api/challenges', {
        ...form,
        badge_id: form.badge_id ? Number(form.badge_id) : null,
        deadline: form.deadline ? form.deadline.replace('T', ' ') + ':00' : null,
      });
      setForm({ title: '', description: '', image: '', badge_id: '', deadline: '' });
      setMsg('Kihívás létrehozva!');
      load();
    } catch (ex) { setMsg(ex.message); }
  }

  async function toggle(c) {
    await api.patch('/api/challenges/' + c.id, { active: c.active ? 0 : 1 });
    load();
  }

  return (
    <div className="grid grid--2" style={{ alignItems: 'start' }}>
      <div className="box">
        <h3 style={{ marginTop: 0 }}>Új kihívás</h3>
        {msg && <p className="alert alert--info">{msg}</p>}
        <form onSubmit={create}>
          <div className="field"><label>Cím *</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="field"><label>Leírás</label><textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="field"><label>Kép fájlnév (a public/challenges mappából, pl. challenge-matrix.svg)</label><input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="challenge-borito-bingo.svg" /></div>
          <div className="field"><label>Plecsni</label>
            <select className="input" value={form.badge_id} onChange={(e) => setForm({ ...form, badge_id: e.target.value })}>
              <option value="">– nincs –</option>
              {badges.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Határidő</label><input className="input" type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
          <button className="btn btn--primary">Létrehozás</button>
        </form>
      </div>
      <div>
        <h3 style={{ marginTop: 0 }}>Meglévő kihívások</h3>
        {list.map((c) => (
          <div className="comment" key={c.id} style={{ borderLeftColor: c.active ? 'var(--green)' : 'var(--rose)' }}>
            <div className="comment__head">
              <strong>{c.title}</strong>
              <button className="btn btn--ghost btn--sm" onClick={() => toggle(c)}>{c.active ? 'Inaktiválás' : 'Aktiválás'}</button>
            </div>
            <p className="small muted" style={{ margin: '4px 0 0' }}>{c.participant_count} résztvevő &middot; {c.active ? 'aktív' : 'lezárult'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PollsAdmin() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [msg, setMsg] = useState('');

  async function create(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/api/polls', { question, options: options.filter((o) => o.trim()) });
      setQuestion(''); setOptions(['', '', '']); setMsg('Szavazás létrehozva!');
    } catch (ex) { setMsg(ex.message); }
  }

  return (
    <div className="box form-narrow">
      <h3 style={{ marginTop: 0 }}>Új szavazás (mit olvassunk közösen?)</h3>
      {msg && <p className="alert alert--info">{msg}</p>}
      <form onSubmit={create}>
        <div className="field"><label>Kérdés</label><input className="input" value={question} onChange={(e) => setQuestion(e.target.value)} required /></div>
        {options.map((o, i) => (
          <div className="field" key={i}>
            <label>{i + 1}. választható könyv</label>
            <input className="input" value={o} onChange={(e) => setOptions((os) => os.map((x, j) => (j === i ? e.target.value : x)))} />
          </div>
        ))}
        <div className="pill-row" style={{ marginBottom: 14 }}>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOptions((os) => [...os, ''])}>+ További opció</button>
        </div>
        <button className="btn btn--primary">Létrehozás</button>
      </form>
    </div>
  );
}

function FormsAdmin() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/api/forms').then(setItems).catch(() => {}); }, []);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Beérkezett űrlapok</h3>
      {items.length === 0 && <p className="empty">Még nincs beérkezett űrlap.</p>}
      {items.map((f) => (
        <div className="comment" key={f.id}>
          <div className="comment__head">
            <strong>{f.name} <span className="tag">{f.type === 'sticker' ? 'Matrica' : 'Nyeremény'}</span></strong>
            <span className="small muted">{fmt(f.created_at)}</span>
          </div>
          <p className="small" style={{ margin: '6px 0' }}>
            Email: <a href={'mailto:' + f.email}>{f.email}</a>{f.subject && <> &middot; Tárgy: {f.subject}</>}
          </p>
          {f.message && <p style={{ margin: '6px 0' }}>{f.message}</p>}
          {f.payload && <pre className="small" style={{ whiteSpace: 'pre-wrap', margin: 0, color: 'var(--ink-soft)' }}>{f.payload}</pre>}
        </div>
      ))}
    </div>
  );
}
