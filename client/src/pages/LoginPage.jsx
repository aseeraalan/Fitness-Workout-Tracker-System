import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthShell } from '../components/AuthShell.jsx';
import { TextInput } from '../components/FormField.jsx';
import { GoogleButton } from '../components/GoogleButton.jsx';
import { validateLogin } from '../validation.js';

const GOOGLE_ERRORS = {
  google_unavailable: 'Google sign-in is not configured on this server.',
  GOOGLE_AUTH_FAILED: 'Google sign-in was cancelled or failed. Try again, or use a username and password.',
  ACCOUNT_LINKING_REQUIRED:
    'An account with that Google email already exists. Sign in with your username and password instead.',
};

export function LoginPage() {
  const { login, authConfig, googleStartUrl } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [values, setValues] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(GOOGLE_ERRORS[params.get('error')] || '');
  const [submitting, setSubmitting] = useState(false);

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setFormError('');
    try {
      await login(values);
      navigate('/profile', { replace: true });
    } catch (error) {
      setErrors(error.payload?.details || {});
      setFormError(error.payload?.message || 'Invalid username/email or password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Welcome back">
      <p className="lede">Sign in with your username or email to open your profile.</p>
      <form onSubmit={onSubmit} noValidate>
        <TextInput
          id="identifier"
          label="Username or email"
          autoComplete="username"
          value={values.identifier}
          onChange={update}
          error={errors.identifier}
        />
        <TextInput
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={update}
          error={errors.password}
        />
        {formError ? (
          <p className="form-error" role="alert">
            {formError}
          </p>
        ) : null}
        <div className="actions">
          <button className="button-primary" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
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
        Need an account? <Link to="/register">Create one</Link>
      </p>
    </AuthShell>
  );
}
