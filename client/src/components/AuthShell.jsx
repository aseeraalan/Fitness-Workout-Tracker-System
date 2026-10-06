import { Link } from 'react-router-dom';

export function AuthShell({ title, children }) {
  return (
    <div className="auth-layout">
      <main className="auth-card">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            FT
          </div>
          <div>
            <p className="eyebrow">FitTrack</p>
            <h1>{title}</h1>
          </div>
        </div>
        {children}
        <p className="switch-auth">
          <Link to="/">Back to home</Link>
        </p>
      </main>
    </div>
  );
}
