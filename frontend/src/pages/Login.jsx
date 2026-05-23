import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await login(email, password);
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
        <h1 style={{ marginTop: 0 }}>Belépés</h1>
        {err && <p className="alert alert--error">{err}</p>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Email vagy felhasználónév</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label>Jelszó</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn--primary btn--block" disabled={busy}>
            {busy ? 'Belépés...' : 'Belépés'}
          </button>
        </form>
        <p className="center small" style={{ marginTop: 16 }}>
          Még nincs fiókod? <Link to="/regisztracio">Regisztrálj!</Link>
        </p>
      </div>
    </section>
  );
}
