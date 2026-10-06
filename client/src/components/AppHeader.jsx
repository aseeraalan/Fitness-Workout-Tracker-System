import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function AppHeader({ title, headingLevel = 'p' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const TitleTag = headingLevel;

  async function onLogout() {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="topbar">
      <Link to="/" className="brand brand-link">
        <div className="brand-mark" aria-hidden="true">
          FT
        </div>
        <div>
          <p className="eyebrow">FitTrack</p>
          <TitleTag className={headingLevel === 'h1' ? 'page-heading' : 'brand-title'}>{title}</TitleTag>
        </div>
      </Link>
      <nav className="nav-actions" aria-label="Account">
        {user ? (
          <>
            <Link className="button button-secondary" to="/profile">
              Profile
            </Link>
            <button type="button" className="button-secondary" onClick={onLogout} disabled={loggingOut}>
              {loggingOut ? 'Logging out…' : 'Log out'}
            </button>
          </>
        ) : (
          <Link className="button button-secondary" to="/login">
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
