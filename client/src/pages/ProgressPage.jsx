import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { AppHeader } from '../components/AppHeader.jsx';
import { TextInput } from '../components/FormField.jsx';
import { formatWorkoutDate, validateProgressFilters } from '../validation.js';
import { localDateString } from '@shared/workoutRules.js';
import { Link } from 'react-router-dom';

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 89);
  return { from: localDateString(from), to: localDateString(to) };
}

export function ProgressPage() {
  const { client } = useAuth();
  const initial = useMemo(() => defaultRange(), []);
  const [filters, setFilters] = useState(initial);
  const [applied, setApplied] = useState(initial);
  const [exercise, setExercise] = useState('');
  const [appliedExercise, setAppliedExercise] = useState('');
  const [data, setData] = useState({ workoutsCompleted: 0, exercises: [], points: [], unit: 'kg' });
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await client.getProgress({
          from: applied.from,
          to: applied.to,
          exercise: appliedExercise || undefined,
        });
        if (cancelled) return;
        setData(result);
        setLoadError('');
        if (!appliedExercise && result.exercises?.[0]) {
          setExercise(result.exercises[0]);
        }
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
  }, [applied.from, applied.to, appliedExercise, client]);

  function apply(event) {
    event.preventDefault();
    const nextErrors = validateProgressFilters(filters);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setLoading(true);
    setApplied({ ...filters });
    setAppliedExercise(exercise);
  }

  const maxWeight = Math.max(0, ...data.points.map((point) => point.highestWeightKg));

  return (
    <div className="page">
      <AppHeader title="Progress" headingLevel="h1" />
      <main className="profile-card" style={{ padding: '1.5rem' }}>
        <p className="lede">
          Workout counts and the highest recorded weight (kg) for one exercise from your saved
          logs. These values are not personal records or a measure of strength.
        </p>

        <form className="filter-row progress-filters" onSubmit={apply}>
          <TextInput
            id="from"
            label="From date"
            type="date"
            value={filters.from}
            onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}
            error={errors.from}
          />
          <TextInput
            id="to"
            label="To date"
            type="date"
            value={filters.to}
            onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
            error={errors.to}
          />
          <div className="field">
            <label htmlFor="exercise">Exercise</label>
            <select
              id="exercise"
              value={exercise}
              onChange={(event) => setExercise(event.target.value)}
              disabled={data.exercises.length === 0}
            >
              <option value="">Choose an exercise</option>
              {data.exercises.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-actions">
            <button className="button-primary" type="submit">
              Update
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
        ) : (
          <>
            <p className="hint">
              Workouts completed in this date range: <strong>{data.workoutsCompleted}</strong>. Unit:{' '}
              <strong>{data.unit}</strong>.
            </p>

            {data.workoutsCompleted === 0 ? (
              <div className="empty-state">
                <h2>No workouts in this date range</h2>
                <p>Log a workout to see counts and exercise weights here.</p>
                <Link className="button button-primary" to="/workouts/new">
                  Log a workout
                </Link>
              </div>
            ) : !appliedExercise ? (
              <div className="empty-state">
                <h2>Choose an exercise</h2>
                <p>Select an exercise you have logged, then update to see weights over time.</p>
              </div>
            ) : data.points.length === 0 ? (
              <div className="empty-state">
                <h2>No logged sets for {appliedExercise}</h2>
                <p>That exercise does not appear in workouts in this date range.</p>
              </div>
            ) : (
              <>
                <h2>
                  Highest weight per workout for {appliedExercise} ({data.unit})
                </h2>
                <ul className="progress-bars" aria-label={`${appliedExercise} highest weight by workout`}>
                  {data.points.map((point) => (
                    <li key={`${point.workoutId}-${point.date}`}>
                      <Link to={`/workouts/${point.workoutId}`}>{formatWorkoutDate(point.date)}</Link>
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${maxWeight ? (point.highestWeightKg / maxWeight) * 100 : 0}%` }}
                        />
                      </div>
                      <span>
                        {point.highestWeightKg} {data.unit}
                      </span>
                    </li>
                  ))}
                </ul>
                <table className="set-table">
                  <thead>
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Workout</th>
                      <th scope="col">Highest weight ({data.unit})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.points.map((point) => (
                      <tr key={point.workoutId}>
                        <td>{formatWorkoutDate(point.date)}</td>
                        <td>
                          <Link to={`/workouts/${point.workoutId}`}>{point.title}</Link>
                        </td>
                        <td>
                          {point.highestWeightKg} {data.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
