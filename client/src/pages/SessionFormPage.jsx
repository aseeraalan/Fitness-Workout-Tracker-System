import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AppHeader } from '../components/AppHeader.jsx';
import { TextArea, TextInput } from '../components/FormField.jsx';
import { emptySessionForm } from '@shared/sessionRules.js';
import { isValidWorkoutDate, todayDateString } from '@shared/workoutRules.js';
import { validateSession } from '../validation.js';
import { calendarPath, safeInternalPath } from '../navigation.js';

function initialForm(searchParams) {
  const form = emptySessionForm(todayDateString());
  form.date = isValidWorkoutDate(searchParams.get('date')) ? searchParams.get('date') : form.date;
  return form;
}

export function SessionFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { client } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = safeInternalPath(searchParams.get('returnTo'), '');
  const [values, setValues] = useState(() => initialForm(searchParams));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const data = await client.getSession(id);
        if (!cancelled) {
          setValues({
            date: data.session.date,
            title: data.session.title,
            notes: data.session.notes || '',
            startTime: data.session.startTime || '',
          });
        }
      } catch (error) {
        if (!cancelled) setLoadError(error.payload?.message || error.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, id, isEdit]);

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = validateSession(values);
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        date: values.date,
        title: values.title,
        notes: values.notes,
        startTime: values.startTime,
      };
      const data = isEdit
        ? await client.updateSession(id, payload)
        : await client.createSession(payload);
      const destination =
        returnTo || calendarPath(data.session.date) || `/sessions/${data.session.id}`;
      navigate(destination, {
        replace: true,
        state: { message: isEdit ? 'Session updated.' : 'Session scheduled.' },
      });
    } catch (error) {
      setErrors(error.payload?.details || {});
      setFormError(error.payload?.message || error.message);
    } finally {
      setSaving(false);
    }
  }

  const cancelTo = returnTo || (isEdit ? `/sessions/${id}` : '/calendar');

  return (
    <div className="page">
      <AppHeader title={isEdit ? 'Edit gym session' : 'Schedule a gym session'} headingLevel="h1" />
      {loading ? (
        <div className="center" role="status" aria-live="polite">
          <div className="spinner" />
        </div>
      ) : loadError ? (
        <main className="profile-card" style={{ padding: '1.5rem' }}>
          <p className="form-error" role="alert">
            {loadError}
          </p>
          <Link className="button button-secondary" to={cancelTo}>
            Back
          </Link>
        </main>
      ) : (
        <main className="profile-card" style={{ padding: '1.5rem' }}>
          <p className="lede">
            Plan a gym visit on a calendar day. Start time is optional and is stored as local clock
            time (HH:MM), not converted between time zones.
          </p>
          <form onSubmit={onSubmit} noValidate>
            <div className="profile-grid">
              <TextInput
                id="date"
                label="Session date"
                type="date"
                value={values.date}
                onChange={update}
                error={errors.date}
                required
              />
              <TextInput
                id="startTime"
                label="Start time (optional)"
                type="time"
                value={values.startTime}
                onChange={update}
                error={errors.startTime}
              />
            </div>
            <TextInput
              id="title"
              label="Title"
              value={values.title}
              onChange={update}
              error={errors.title}
              required
            />
            <TextArea
              id="notes"
              label="Notes (optional)"
              value={values.notes}
              onChange={update}
              error={errors.notes}
              rows={3}
            />
            {formError ? (
              <p className="form-error" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="actions">
              <button className="button-primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save session'}
              </button>
              <Link className="button button-secondary" to={cancelTo}>
                Cancel
              </Link>
            </div>
          </form>
        </main>
      )}
    </div>
  );
}
