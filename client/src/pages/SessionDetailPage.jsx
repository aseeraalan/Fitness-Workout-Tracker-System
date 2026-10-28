import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AppHeader } from '../components/AppHeader.jsx';
import { formatWorkoutDate } from '../validation.js';
import { calendarPath, safeInternalPath, withReturnTo } from '../navigation.js';

export function SessionDetailPage() {
  const { id } = useParams();
  const { client } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = safeInternalPath(searchParams.get('returnTo'), '');
  const [session, setSession] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await client.getSession(id);
        if (!cancelled) setSession(data.session);
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
      await client.deleteSession(id);
      navigate(returnTo || calendarPath(session?.date) || '/calendar', {
        replace: true,
        state: { message: 'Session deleted.' },
      });
    } catch (error) {
      setActionError(error.payload?.message || error.message);
      setConfirmingDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  const backTo = returnTo || calendarPath(session?.date) || '/calendar';

  return (
    <div className="page">
      <AppHeader title="Gym session" headingLevel="h1" />
      {loading ? (
        <div className="center" role="status" aria-live="polite">
          <div className="spinner" />
        </div>
      ) : loadError ? (
        <main className="profile-card" style={{ padding: '1.5rem' }}>
          <p className="form-error" role="alert">
            {loadError}
          </p>
          <Link className="button button-secondary" to={backTo}>
            Back to calendar
          </Link>
        </main>
      ) : (
        <main className="profile-card" style={{ padding: '1.5rem' }}>
          <p className="eyebrow">{formatWorkoutDate(session.date)}</p>
          <h2>{session.title}</h2>
          <p className="lede">
            {session.startTime ? `Starts at ${session.startTime}. ` : 'No start time set. '}
            {session.notes || 'No notes.'}
          </p>
          {actionError ? (
            <p className="form-error" role="alert">
              {actionError}
            </p>
          ) : null}
          {confirmingDelete ? (
            <div className="confirm-box" role="alertdialog" aria-labelledby="delete-session-title">
              <p id="delete-session-title">
                <strong>Delete this gym session?</strong>
              </p>
              <p>This cannot be undone.</p>
              <div className="inline-actions">
                <button type="button" className="button-danger" onClick={onConfirmDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Delete session'}
                </button>
                <button type="button" className="button-secondary" onClick={() => setConfirmingDelete(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="inline-actions">
              <Link className="button button-primary" to={withReturnTo(`/sessions/${session.id}/edit`, returnTo)}>
                Edit
              </Link>
              <button type="button" className="button-danger" onClick={() => setConfirmingDelete(true)}>
                Delete
              </button>
              <Link className="button button-secondary" to={backTo}>
                Back to calendar
              </Link>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
