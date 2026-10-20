import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AppHeader } from '../components/AppHeader.jsx';
import { TextInput } from '../components/FormField.jsx';
import { formatWorkoutDate, validateWorkoutFilters } from '../validation.js';
import { PAGE_SIZE_DEFAULT } from '@shared/workoutRules.js';

const emptyFilters = { from: '', to: '' };

export function WorkoutHistoryPage() {
  const { client } = useAuth();
  const location = useLocation();
  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ workouts: [], total: 0, totalPages: 1, page: 1 });
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [message] = useState(location.state?.message || '');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await client.listWorkouts({
          from: applied.from || undefined,
          to: applied.to || undefined,
          page,
          limit: PAGE_SIZE_DEFAULT,
        });
        if (cancelled) return;
        setData(result);
        setLoadError('');
      } catch (error) {
        if (cancelled) return;
        setLoadError(error.payload?.message || error.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applied.from, applied.to, client, page]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();
    const nextErrors = validateWorkoutFilters(filters);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setLoading(true);
    setPage(1);
    setApplied({ ...filters });
  }

  function clearFilters() {
    setLoading(true);
    setFilters(emptyFilters);
    setApplied(emptyFilters);
    setErrors({});
    setPage(1);
  }

  const hasDateFilter = Boolean(applied.from || applied.to);
  const empty = !loading && data.workouts.length === 0;

  return (
    <div className="page">
      <AppHeader title="Workout history" headingLevel="h1" />
      <main className="profile-card" style={{ padding: '1.5rem' }}>
        <div className="section-heading">
          <p className="lede" style={{ marginBottom: 0 }}>
            Your saved workouts, newest first. Filter by date or open a session to view, edit, or
            delete it.
          </p>
          <Link className="button button-primary" to="/workouts/new">
            Log a workout
          </Link>
        </div>

        {message ? (
          <p className="success" role="status">
            {message}
          </p>
        ) : null}

        <form className="filter-row" onSubmit={applyFilters}>
          <TextInput
            id="from"
            label="From date"
            type="date"
            value={filters.from}
            onChange={updateFilter}
            error={errors.from}
          />
          <TextInput
            id="to"
            label="To date"
            type="date"
            value={filters.to}
            onChange={updateFilter}
            error={errors.to}
          />
          <div className="filter-actions">
            <button className="button-primary" type="submit">
              Apply dates
            </button>
            <button className="button-secondary" type="button" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </form>

        {loadError ? (
          <p className="form-error" role="alert">
            {loadError}
          </p>
        ) : null}

        {loading ? (
          <div className="center" role="status" aria-live="polite">
            <div className="spinner" />
          </div>
        ) : empty ? (
          <div className="empty-state">
            <h2>{hasDateFilter ? 'No workouts in this date range' : 'No workouts yet'}</h2>
            <p>
              {hasDateFilter
                ? 'Try a wider date range, or clear the filter to see every saved session.'
                : 'Log a workout to start your history. Each session is saved to your account.'}
            </p>
            {!hasDateFilter ? (
              <Link className="button button-primary" to="/workouts/new">
                Log your first workout
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            <p className="hint">
              {`Showing ${data.workouts.length} of ${data.total} workout${data.total === 1 ? '' : 's'}${hasDateFilter ? ' in this date range' : ''}.`}
            </p>
            <ul className="workout-list">
              {data.workouts.map((workout) => (
                <li key={workout.id} className="workout-card">
                  <div>
                    <p className="eyebrow">{formatWorkoutDate(workout.date)}</p>
                    <h2>{workout.title}</h2>
                    <p className="hint">
                      {workout.exercises.length} exercise
                      {workout.exercises.length === 1 ? '' : 's'}
                      {workout.notes
                        ? ` · ${workout.notes.length > 80 ? `${workout.notes.slice(0, 80)}…` : workout.notes}`
                        : ''}
                    </p>
                  </div>
                  <div className="inline-actions">
                    <Link className="button button-primary" to={`/workouts/${workout.id}`}>
                      View
                    </Link>
                    <Link className="button button-secondary" to={`/workouts/${workout.id}/edit`}>
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
            <div className="pagination">
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setLoading(true);
                  setPage((current) => Math.max(1, current - 1));
                }}
                disabled={page <= 1}
              >
                Previous
              </button>
              <p>
                Page {data.page} of {data.totalPages}
              </p>
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setLoading(true);
                  setPage((current) => current + 1);
                }}
                disabled={page >= data.totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
