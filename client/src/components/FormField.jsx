export function Field({ id, label, error, hint, children }) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint ? (
        <p id={hintId} className="hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({ id, label, error, hint, type = 'text', autoComplete, ...props }) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...props}
      />
    </Field>
  );
}
