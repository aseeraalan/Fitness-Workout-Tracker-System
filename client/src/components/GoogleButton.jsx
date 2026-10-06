export function GoogleButton({ enabled, startUrl, unavailableMessage, loading }) {
  if (!enabled) {
    return (
      <div>
        <button type="button" className="google-button" disabled aria-disabled="true">
          Continue with Google
        </button>
        <p className="hint">
          {unavailableMessage ||
            'Google sign-in is not configured. You can still use a username and password.'}
        </p>
      </div>
    );
  }

  return (
    <a className="google-button button" href={startUrl} aria-disabled={loading}>
      Continue with Google
    </a>
  );
}
