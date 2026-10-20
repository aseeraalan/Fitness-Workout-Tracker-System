import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AppHeader } from '../components/AppHeader.jsx';
import { formatWorkoutDate } from '../validation.js';

export function WorkoutDetailPage() {
  const { id } = useParams();
  const { client } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [workout, setWorkout] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message] = useState(location.state?.message || '');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const data = await client.getWorkout(id);
        if (!cancelled) setWorkout(data.workout);
      } catch (error) {
        if (!cancelled) setLoadError(error.payload?.message || error.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, id]);

  async function onConfirmDelete() {
    setDeleting(true);
    setActionError('');
    try {
      await client.deleteWorkout(id);
      navigate('/workouts', { replace: true, state: { message: 'Workout deleted.' } });
    } catch (error) {
      setActionError(error.payload?.message || error.message);
      setConfirmingDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page">
      <AppHeader title="Workout details" headingLevel="h1" />
      {loading ? (
        <div className="center" role="status" aria-live="polite">
          <div className="spinner" />
        </div>
      ) : loadError ? (
        <main className="profile-card" style={{ padding: '1.5rem' }}>
          <p className="form-error" role="alert">
            {loadError}
          </p>
          <Link className="button button-secondary" to="/workouts">
            Back to history
          </Link>
        </main>
      ) : (
        <main className="profile-card" style={{ padding: '1.5rem' }}>
          {message ? (
            <p className="success" role="status">
              {message}
            </p>
          ) : null}
          <p className="eyebrow">{formatWorkoutDate(workout.date)}</p>
          <h2>{workout.title}</h2>
          {workout.notes ? <p className="lede">{workout.notes}</p> : <p className="lede">No notes.</p>}

          <ol className="detail-exercises">
            {workout.exercises.map((exercise, index) => (
              <li key={`${exercise.name}-${index}`} className="exercise-block">
                <h3>{exercise.name}</h3>
                <table className="set-table">
                  <thead>
                    <tr>
                      <th scope="col">Set</th>
                      <th scope="col">Reps</th>
                      <th scope="col">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set, setIndex) => (
                      <tr key={setIndex}>
                        <td>{setIndex + 1}</td>
                        <td>{set.reps}</td>
                        <td>{set.weightKg} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </li>
            ))}
          </ol>

          {actionError ? (
            <p className="form-error" role="alert">
              {actionError}
            </p>
          ) : null}

          {confirmingDelete ? (
            <div className="confirm-box" role="alertdialog" aria-labelledby="delete-title" aria-describedby="delete-body">
              <p id="delete-title">
                <strong>Delete this workout?</strong>
              </p>
              <p id="delete-body">This cannot be undone.</p>
              <div className="inline-actions">
                <button type="button" className="button-danger" onClick={onConfirmDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Delete workout'}
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="inline-actions">
              <Link className="button button-primary" to={`/workouts/${workout.id}/edit`}>
                Edit
              </Link>
              <button type="button" className="button-danger" onClick={() => setConfirmingDelete(true)}>
                Delete
              </button>
              <Link className="button button-secondary" to="/workouts">
                Back to history
              </Link>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
