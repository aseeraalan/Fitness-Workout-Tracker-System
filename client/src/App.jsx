import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { WorkoutHistoryPage } from './pages/WorkoutHistoryPage.jsx';
import { WorkoutFormPage } from './pages/WorkoutFormPage.jsx';
import { WorkoutDetailPage } from './pages/WorkoutDetailPage.jsx';
import { CalendarPage } from './pages/CalendarPage.jsx';
import { SessionFormPage } from './pages/SessionFormPage.jsx';
import { SessionDetailPage } from './pages/SessionDetailPage.jsx';
import { ProgressPage } from './pages/ProgressPage.jsx';

export default function App() {
  const { bootError, loading } = useAuth();

  if (loading) {
    return (
      <div className="center" role="status" aria-live="polite">
        <div className="spinner" />
      </div>
    );
  }

  if (bootError) {
    return (
      <div className="page">
        <div className="hero-card home-panel">
          <h1>Cannot reach the FitTrack API</h1>
          <p className="lede">{bootError}</p>
          <p className="hint">Start the backend with npm run dev:server, then refresh.</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workouts"
        element={
          <ProtectedRoute>
            <WorkoutHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workouts/new"
        element={
          <ProtectedRoute>
            <WorkoutFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workouts/:id/edit"
        element={
          <ProtectedRoute>
            <WorkoutFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workouts/:id"
        element={
          <ProtectedRoute>
            <WorkoutDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions/new"
        element={
          <ProtectedRoute>
            <SessionFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions/:id/edit"
        element={
          <ProtectedRoute>
            <SessionFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions/:id"
        element={
          <ProtectedRoute>
            <SessionDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
