import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../App.jsx';
import { createMockClient, renderWithAuth, sampleUser } from './testUtils.jsx';

const squatWorkout = {
  id: '10',
  ownerId: '1',
  date: '2026-10-18',
  title: 'Lower body strength',
  notes: 'Felt strong.',
  exercises: [{ name: 'Back squat', sets: [{ reps: 5, weightKg: 85 }] }],
};

const gymSession = {
  id: '20',
  ownerId: '1',
  date: '2026-10-18',
  title: 'Evening gym',
  startTime: '18:30',
  notes: 'Rack 3',
};

function renderApp(options = {}) {
  const client = createMockClient({
    user: options.user || sampleUser,
    workouts: options.workouts || [],
    sessions: options.sessions || [],
  });
  render(renderWithAuth(<App />, { client, route: options.route || '/calendar?date=2026-10-18' }));
  return { client };
}

describe('S3 calendar, scheduling, and progress pages', () => {
  it('redirects guests away from the calendar', async () => {
    const client = createMockClient();
    render(renderWithAuth(<App />, { client, route: '/calendar' }));
    expect(await screen.findByRole('heading', { name: 'Welcome to FitTrack' })).toBeInTheDocument();
  });

  it('shows scheduled sessions and logged workouts on the selected day with a legend', async () => {
    renderApp({ workouts: [squatWorkout], sessions: [gymSession] });

    expect(await screen.findByRole('heading', { name: 'Calendar' })).toBeInTheDocument();
    expect(screen.getByLabelText('Calendar legend')).toHaveTextContent('Scheduled session');
    expect(screen.getByLabelText('Calendar legend')).toHaveTextContent('Logged workout');
    expect(await screen.findByText(/Evening gym/)).toBeInTheDocument();
    expect(screen.getByText('Lower body strength')).toBeInTheDocument();
    expect(screen.getAllByText('Scheduled session').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Logged workout').length).toBeGreaterThan(0);
  });

  it('shows an empty state for a day with no activity', async () => {
    renderApp({ route: '/calendar?date=2026-10-19' });
    expect(await screen.findByText('No sessions or workouts on this day.')).toBeInTheDocument();
  });

  it('prefills the workout form with the selected calendar date', async () => {
    const user = userEvent.setup();
    renderApp();

    await screen.findByText('No sessions or workouts on this day.');
    await user.click(screen.getByRole('link', { name: 'Log a workout' }));
    expect(await screen.findByRole('heading', { name: 'Log a workout' })).toBeInTheDocument();
    expect(screen.getByLabelText('Workout date')).toHaveValue('2026-10-18');
  });

  it('opens workout details from the selected day', async () => {
    const user = userEvent.setup();
    renderApp({ workouts: [squatWorkout] });

    expect(await screen.findByText('Lower body strength')).toBeInTheDocument();
    await user.click(screen.getAllByRole('link', { name: 'View' })[0]);
    expect(await screen.findByRole('heading', { name: 'Lower body strength' })).toBeInTheDocument();
    expect(screen.getByText('85 kg')).toBeInTheDocument();
  });

  it('schedules a gym session from the calendar and returns to that date', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/calendar?date=2026-10-21' });

    await screen.findByText('No sessions or workouts on this day.');
    await user.click(screen.getByRole('link', { name: 'Schedule a session' }));
    expect(await screen.findByRole('heading', { name: 'Schedule a gym session' })).toBeInTheDocument();
    expect(screen.getByLabelText('Session date')).toHaveValue('2026-10-21');
    await user.type(screen.getByLabelText('Title'), 'Morning lift');
    await user.click(screen.getByRole('button', { name: 'Save session' }));
    expect(await screen.findByRole('heading', { name: 'Calendar' })).toBeInTheDocument();
    expect(await screen.findByText('Morning lift')).toBeInTheDocument();
  });

  it('shows progress empty state and then highest kg for a selected exercise', async () => {
    const user = userEvent.setup();
    const client = createMockClient({
      user: sampleUser,
      workouts: [squatWorkout],
    });
    render(renderWithAuth(<App />, { client, route: '/progress' }));

    expect(await screen.findByRole('heading', { name: 'Progress' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('From date'), { target: { value: '2026-10-01' } });
    fireEvent.change(screen.getByLabelText('To date'), { target: { value: '2026-10-31' } });
    await user.click(screen.getByRole('button', { name: 'Update' }));
    await user.selectOptions(await screen.findByLabelText('Exercise'), 'Back squat');
    await user.click(screen.getByRole('button', { name: 'Update' }));
    expect(await screen.findByText('85 kg')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Highest weight (kg)' })).toBeInTheDocument();
  });

  it('lets a Google-authenticated user open the log-workout form', async () => {
    renderApp({
      user: { ...sampleUser, authProvider: 'google' },
      route: '/workouts/new',
    });
    expect(await screen.findByRole('heading', { name: 'Log a workout' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save workout' })).toBeInTheDocument();
  });

  it('moves between months with labeled controls', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/calendar?date=2026-10-18' });
    expect(await screen.findByRole('heading', { name: 'October 2026' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(await screen.findByRole('heading', { name: 'November 2026' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(await screen.findByRole('heading', { name: 'October 2026' })).toBeInTheDocument();
  });

  it('shows an error when the calendar request fails', async () => {
    const client = createMockClient({ user: sampleUser });
    client.failNextCalendar();
    render(renderWithAuth(<App />, { client, route: '/calendar?date=2026-10-18' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load calendar.');
  });

  it('shows an error when the progress request fails', async () => {
    const client = createMockClient({ user: sampleUser, workouts: [squatWorkout] });
    client.failNextProgress();
    render(renderWithAuth(<App />, { client, route: '/progress' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load progress.');
  });
});
