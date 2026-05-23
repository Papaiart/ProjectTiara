import { useState } from 'react';
import { api } from '../api';

export default function SubmissionForm({ type, subjectLabel, subjectPlaceholder, extraFields = [] }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [extra, setExtra] = useState({});
  const [status, setStatus] = useState(null); // {ok, message}
  const [busy, setBusy] = useState(false);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const payload = extraFields.length
        ? extraFields.map((f) => `${f.label}: ${extra[f.key] || '-'}`).join('\n')
        : '';
      const res = await api.post('/api/forms', { type, ...form, payload });
      setStatus({ ok: true, message: res.message });
      setForm({ name: '', email: '', subject: '', message: '' });
      setExtra({});
    } catch (ex) {
      setStatus({ ok: false, message: ex.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="box">
      {status && (
        <p className={'alert ' + (status.ok ? 'alert--success' : 'alert--error')}>{status.message}</p>
      )}
      <div className="grid grid--2">
        <div className="field">
          <label>Neved *</label>
          <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div className="field">
          <label>Email címed *</label>
          <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
        </div>
      </div>
      <div className="field">
        <label>{subjectLabel}</label>
        <input className="input" value={form.subject} onChange={(e) => set('subject', e.target.value)} placeholder={subjectPlaceholder} />
      </div>
      {extraFields.map((f) => (
        <div className="field" key={f.key}>
          <label>{f.label}</label>
          <input className="input" value={extra[f.key] || ''} onChange={(e) => setExtra((x) => ({ ...x, [f.key]: e.target.value }))} placeholder={f.placeholder || ''} />
        </div>
      ))}
      <div className="field">
        <label>Üzenet</label>
        <textarea className="textarea" value={form.message} onChange={(e) => set('message', e.target.value)} />
      </div>
      <button className="btn btn--primary" disabled={busy}>{busy ? 'Küldés...' : 'Küldés'}</button>
      <p className="small muted" style={{ marginTop: 14, marginBottom: 0 }}>
        A küldés gombra kattintva elfogadod az adatkezelési tájékoztatónkat. Az adataidat kizárólag a
        megkeresés feldolgozására használjuk.
      </p>
    </form>
  );
}
