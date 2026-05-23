import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { assetUrl } from '../api';

const LINKS = [
  { to: '/', label: 'Főoldal', end: true },
  { to: '/kihivasok', label: 'Kihívások' },
  { to: '/nyeremenyjatek', label: 'Nyereményjáték' },
  { to: '/matrica-rendeles', label: 'Matrica rendelés' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/');
  }

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link to="/" className="nav__logo" onClick={() => setOpen(false)}>
          <img src={assetUrl('brand/logo.svg')} alt="Tiara" />
        </Link>
        <button className="nav__toggle" onClick={() => setOpen((o) => !o)} aria-label="Menü">
          &#9776;
        </button>
        <nav className={'nav__links' + (open ? ' open' : '')}>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => 'nav__link' + (isActive ? ' active' : '')}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/profil"
            className={({ isActive }) => 'nav__link' + (isActive ? ' active' : '')}
            onClick={() => setOpen(false)}
          >
            Profil
          </NavLink>
          {user?.is_admin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => 'nav__link' + (isActive ? ' active' : '')}
              onClick={() => setOpen(false)}
            >
              Admin
            </NavLink>
          )}
          {user ? (
            <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
              Kilépés ({user.username})
            </button>
          ) : (
            <Link to="/belepes" className="btn btn--primary btn--sm" onClick={() => setOpen(false)}>
              Belépés
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
