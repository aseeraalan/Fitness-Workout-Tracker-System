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
              Signed in as <strong>{user.username}</strong>. Log workouts, open the calendar, or
              review progress.
            </p>
            <div className="home-actions">
              <Link className="button button-primary" to="/calendar">
                Calendar
              </Link>
              <Link className="button button-secondary" to="/workouts">
                Workout history
              </Link>
              <Link className="button button-secondary" to="/progress">
                Progress
              </Link>
              <Link className="button button-secondary" to="/workouts/new">
                Log a workout
              </Link>
              <Link className="button button-secondary" to="/profile">
                Go to profile
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="lede">
              Create an account or sign in to log workouts, schedule gym sessions, and view your
              calendar.
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
