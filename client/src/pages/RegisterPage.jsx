import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthShell } from '../components/AuthShell.jsx';
import { TextInput } from '../components/FormField.jsx';
import { GoogleButton } from '../components/GoogleButton.jsx';
import {
  PASSWORD_RULES_TEXT,
  USERNAME_RULES_TEXT,
  validateRegister,
} from '../validation.js';

const empty = {
  name: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
};

export function RegisterPage() {
  const { register, authConfig, googleStartUrl } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const describedPassword = useMemo(() => PASSWORD_RULES_TEXT, []);

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = validateRegister(values);
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await register(values);
      navigate('/profile', { replace: true });
    } catch (error) {
      setErrors(error.payload?.details || {});
      setFormError(error.payload?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Create your account">
      <p className="lede">Start tracking workouts with a free FitTrack profile.</p>
      <form onSubmit={onSubmit} noValidate>
        <TextInput
          id="name"
          label="Name"
          autoComplete="name"
          value={values.name}
          onChange={update}
          error={errors.name}
        />
        <TextInput
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={update}
          error={errors.email}
        />
        <TextInput
          id="username"
          label="Username"
          autoComplete="username"
          value={values.username}
          onChange={update}
          error={errors.username}
          hint={USERNAME_RULES_TEXT}
        />
        <TextInput
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={update}
          error={errors.password}
          hint={describedPassword}
        />
        <TextInput
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={update}
          error={errors.confirmPassword}
        />
        {formError ? (
          <p className="form-error" role="alert">
            {formError}
          </p>
        ) : null}
        <div className="actions">
          <button className="button-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
          <GoogleButton
            enabled={authConfig.googleEnabled}
            startUrl={googleStartUrl}
            unavailableMessage={authConfig.googleUnavailableMessage}
            loading={submitting}
          />
        </div>
      </form>
      <p className="switch-auth">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
}
