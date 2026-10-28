import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AppHeader } from '../components/AppHeader.jsx';
import { TextArea, TextInput } from '../components/FormField.jsx';
import { formToWorkoutPayload, validateWorkout, workoutToForm } from '../validation.js';
import {
  EXERCISE_MAX_COUNT,
  SETS_MAX_COUNT,
  emptyExercise,
  emptySet,
  emptyWorkoutForm,
  isValidWorkoutDate,
} from '@shared/workoutRules.js';
import { safeInternalPath } from '../navigation.js';

function initialWorkoutForm(searchParams) {
  const form = emptyWorkoutForm();
  const date = searchParams.get('date');
  if (isValidWorkoutDate(date)) form.date = date;
  return form;
}

export function WorkoutFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { client } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = safeInternalPath(searchParams.get('returnTo'), '');
  const [values, setValues] = useState(() => initialWorkoutForm(searchParams));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const data = await client.getWorkout(id);
        if (!cancelled) setValues(workoutToForm(data.workout));
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

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function updateExerciseName(index, value) {
    setValues((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, i) =>
        i === index ? { ...exercise, name: value } : exercise
      ),
    }));
  }

  function updateSet(exerciseIndex, setIndex, field, value) {
    setValues((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, i) =>
        i === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, j) => (j === setIndex ? { ...set, [field]: value } : set)),
            }
          : exercise
      ),
    }));
  }

  function addExercise() {
    setValues((current) =>
      current.exercises.length >= EXERCISE_MAX_COUNT
        ? current
        : { ...current, exercises: [...current.exercises, emptyExercise()] }
    );
  }

  function removeExercise(index) {
    setValues((current) =>
      current.exercises.length <= 1
        ? current
        : { ...current, exercises: current.exercises.filter((_, i) => i !== index) }
    );
  }

  function addSet(exerciseIndex) {
    setValues((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, i) =>
        i === exerciseIndex && exercise.sets.length < SETS_MAX_COUNT
          ? { ...exercise, sets: [...exercise.sets, emptySet()] }
          : exercise
      ),
    }));
  }

  function removeSet(exerciseIndex, setIndex) {
    setValues((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, i) =>
        i === exerciseIndex && exercise.sets.length > 1
          ? { ...exercise, sets: exercise.sets.filter((_, j) => j !== setIndex) }
          : exercise
      ),
    }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = validateWorkout(values);
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = formToWorkoutPayload(values);
      const data = isEdit
        ? await client.updateWorkout(id, payload)
        : await client.createWorkout(payload);
      navigate(returnTo || `/workouts/${data.workout.id}`, {
        replace: true,
        state: { message: isEdit ? 'Workout updated.' : 'Workout saved.' },
      });
    } catch (error) {
      setErrors(error.payload?.details || {});
      setFormError(error.payload?.message || error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <AppHeader title={isEdit ? 'Edit workout' : 'Log a workout'} headingLevel="h1" />
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
          <p className="lede">
            Record the date, title, optional notes, and each exercise with sets, repetitions, and
            weight in kilograms.
          </p>
          <form onSubmit={onSubmit} noValidate>
            <div className="profile-grid">
              <TextInput
                id="date"
                label="Workout date"
                type="date"
                value={values.date}
                onChange={updateField}
                error={errors.date}
                required
              />
              <TextInput
                id="title"
                label="Title"
                value={values.title}
                onChange={updateField}
                error={errors.title}
                maxLength={80}
                required
              />
            </div>
            <TextArea
              id="notes"
              label="Notes (optional)"
              value={values.notes}
              onChange={updateField}
              error={errors.notes}
              rows={3}
              maxLength={1000}
            />
            {errors.exercises ? (
              <p className="form-error" role="alert">
                {errors.exercises}
              </p>
            ) : null}

            {values.exercises.map((exercise, exerciseIndex) => (
              <fieldset key={exerciseIndex} className="exercise-block">
                <legend>Exercise {exerciseIndex + 1}</legend>
                <TextInput
                  id={`exercise-${exerciseIndex}-name`}
                  label="Exercise name"
                  value={exercise.name}
                  onChange={(event) => updateExerciseName(exerciseIndex, event.target.value)}
                  error={errors[`exercises.${exerciseIndex}.name`]}
                  required
                />
                {errors[`exercises.${exerciseIndex}.sets`] ? (
                  <p className="form-error" role="alert">
                    {errors[`exercises.${exerciseIndex}.sets`]}
                  </p>
                ) : null}
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="set-row">
                    <TextInput
                      id={`exercise-${exerciseIndex}-set-${setIndex}-reps`}
                      label={`Set ${setIndex + 1} reps`}
                      type="number"
                      min="1"
                      max="500"
                      step="1"
                      value={set.reps}
                      onChange={(event) =>
                        updateSet(exerciseIndex, setIndex, 'reps', event.target.value)
                      }
                      error={errors[`exercises.${exerciseIndex}.sets.${setIndex}.reps`]}
                      required
                    />
                    <TextInput
                      id={`exercise-${exerciseIndex}-set-${setIndex}-weight`}
                      label="Weight (kg)"
                      type="number"
                      min="0"
                      max="1000"
                      step="0.5"
                      value={set.weightKg}
                      onChange={(event) =>
                        updateSet(exerciseIndex, setIndex, 'weightKg', event.target.value)
                      }
                      error={errors[`exercises.${exerciseIndex}.sets.${setIndex}.weightKg`]}
                      required
                    />
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => removeSet(exerciseIndex, setIndex)}
                      disabled={exercise.sets.length <= 1}
                    >
                      Remove set
                    </button>
                  </div>
                ))}
                <div className="inline-actions">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => addSet(exerciseIndex)}
                    disabled={exercise.sets.length >= SETS_MAX_COUNT}
                  >
                    Add set
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => removeExercise(exerciseIndex)}
                    disabled={values.exercises.length <= 1}
                  >
                    Remove exercise
                  </button>
                </div>
              </fieldset>
            ))}

            <div className="inline-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={addExercise}
                disabled={values.exercises.length >= EXERCISE_MAX_COUNT}
              >
                Add exercise
              </button>
            </div>

            {formError ? (
              <p className="form-error" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="actions">
              <button className="button-primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save workout'}
              </button>
              <Link className="button button-secondary" to={returnTo || (isEdit ? `/workouts/${id}` : '/workouts')}>
                Cancel
              </Link>
            </div>
          </form>
        </main>
      )}
    </div>
  );
}
