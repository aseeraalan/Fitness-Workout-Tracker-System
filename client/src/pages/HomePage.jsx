import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AppHeader } from '../components/AppHeader.jsx';

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="page">
      <AppHeader title="Home" />
      <section className="home-panel hero-card">
        <p className="eyebrow">CPS714 Fitness and Workout Tracker</p>
        <h1>Welcome to FitTrack</h1>
        {user ? (
          <>
            <p className="lede">
              Signed in as <strong>{user.username}</strong>. Open your profile to view and edit your
              details, or log out from the header.
            </p>
            <div className="home-actions">
              <Link className="button button-primary" to="/profile">
                Go to profile
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="lede">
              Create an account or sign in to open your profile. Workout tracking will arrive in a
              later sprint.
            </p>
            <div className="home-actions">
              <Link className="button button-primary" to="/register">
                Create an account
              </Link>
              <Link className="button button-secondary" to="/login">
                Sign in
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
