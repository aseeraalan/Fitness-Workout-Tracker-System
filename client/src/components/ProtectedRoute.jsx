import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="center" role="status" aria-live="polite">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="center" role="status" aria-live="polite">
        <div className="spinner" />
      </div>
    );
  }
  if (user) return <Navigate to="/profile" replace />;
  return children;
}
