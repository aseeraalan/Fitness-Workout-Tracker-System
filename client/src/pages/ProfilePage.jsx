import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { AppHeader } from '../components/AppHeader.jsx';
import { Field, TextInput } from '../components/FormField.jsx';
import { USERNAME_RULES_TEXT, validateProfile } from '../validation.js';

export function ProfilePage() {
  const { user, saveProfile } = useAuth();
  const [values, setValues] = useState({
    name: user.name,
    username: user.username,
    heightCm: user.heightCm ?? '',
    weightKg: user.weightKg ?? '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = validateProfile(values);
    setErrors(nextErrors);
    setMessage('');
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await saveProfile({
        name: values.name,
        username: values.username,
        heightCm: values.heightCm === '' ? '' : Number(values.heightCm),
        weightKg: values.weightKg === '' ? '' : Number(values.weightKg),
      });
      setMessage('Profile saved.');
    } catch (error) {
      setErrors(error.payload?.details || {});
      setFormError(error.payload?.message || error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <AppHeader title="Your profile" headingLevel="h1" />

      <main className="profile-card" style={{ padding: '1.5rem' }}>
        <p className="lede">
          Signed in as <strong>{user.username}</strong>. Email cannot be changed in this sprint.
        </p>
        <form onSubmit={onSubmit} noValidate>
          <div className="profile-grid">
            <TextInput id="name" label="Name" value={values.name} onChange={update} error={errors.name} />
            <TextInput
              id="username"
              label="Username"
              value={values.username}
              onChange={update}
              error={errors.username}
              hint={USERNAME_RULES_TEXT}
            />
            <Field id="email" label="Email">
              <div id="email" className="readonly-box">
                {user.email}
              </div>
            </Field>
            <TextInput
              id="heightCm"
              label="Height (cm)"
              type="number"
              value={values.heightCm}
              onChange={update}
              error={errors.heightCm}
            />
            <TextInput
              id="weightKg"
              label="Weight (kg)"
              type="number"
              value={values.weightKg}
              onChange={update}
              error={errors.weightKg}
            />
          </div>
          {formError ? (
            <p className="form-error" role="alert">
              {formError}
            </p>
          ) : null}
          {message ? (
            <p className="success" role="status">
              {message}
            </p>
          ) : null}
          <div className="actions">
            <button className="button-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
