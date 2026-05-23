import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/profil');
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section container">
      <div className="form-narrow box">
        <h1 style={{ marginTop: 0 }}>Regisztráció</h1>
        <p className="muted">Hozd létre a fiókod, és kezdd el gyűjteni a plecsniket!</p>
        {err && <p className="alert alert--error">{err}</p>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Felhasználónév</label>
            <input className="input" value={form.username} onChange={(e) => set('username', e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </div>
          <div className="field">
            <label>Jelszó (legalább 6 karakter)</label>
            <input className="input" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={6} />
          </div>
          <button className="btn btn--primary btn--block" disabled={busy}>
            {busy ? 'Regisztráció...' : 'Regisztráció'}
          </button>
        </form>
        <p className="center small" style={{ marginTop: 16 }}>
          Már van fiókod? <Link to="/belepes">Lépj be!</Link>
        </p>
      </div>
    </section>
  );
}
