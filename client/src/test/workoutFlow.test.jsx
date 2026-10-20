import { render, screen, within } from '@testing-library/react';
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
  exercises: [
    {
      name: 'Back squat',
      sets: [
        { reps: 5, weightKg: 80 },
        { reps: 5, weightKg: 85 },
      ],
    },
  ],
  createdAt: '2026-10-18T12:00:00.000Z',
  updatedAt: '2026-10-18T12:00:00.000Z',
};

function renderApp(options = {}) {
  const client = createMockClient({
    user: sampleUser,
    ...options,
  });
  render(renderWithAuth(<App />, { client, route: options.route || '/workouts' }));
  return { client };
}

async function fillRequiredWorkoutFields(user) {
  await user.clear(screen.getByLabelText('Title'));
  await user.type(screen.getByLabelText('Title'), 'Push day');
  await user.clear(screen.getByLabelText('Exercise name'));
  await user.type(screen.getByLabelText('Exercise name'), 'Bench press');
  await user.type(screen.getByLabelText('Set 1 reps'), '8');
  await user.type(screen.getByLabelText('Weight (kg)'), '60');
}

describe('S2 workout pages', () => {
  it('redirects guests away from workout routes', async () => {
    const client = createMockClient();
    render(renderWithAuth(<App />, { client, route: '/workouts' }));
    expect(await screen.findByRole('heading', { name: 'Welcome to FitTrack' })).toBeInTheDocument();
  });

  it('shows an empty history state and opens the create form', async () => {
    const user = userEvent.setup();
    renderApp();

    expect(await screen.findByRole('heading', { name: 'No workouts yet' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Log your first workout' }));
    expect(await screen.findByRole('heading', { name: 'Log a workout' })).toBeInTheDocument();
  });

  it('validates missing workout fields before calling the API', async () => {
    const user = userEvent.setup();
    const { client } = renderApp({ route: '/workouts/new' });

    await screen.findByLabelText('Title');
    await user.click(screen.getByRole('button', { name: 'Save workout' }));

    expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
    expect(client.calls.find((call) => call[0] === 'createWorkout')).toBeUndefined();
  });

  it('creates a workout and shows the saved details', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/workouts/new' });

    await screen.findByLabelText('Title');
    await fillRequiredWorkoutFields(user);
    await user.type(screen.getByLabelText('Notes (optional)'), 'Felt explosive.');
    await user.click(screen.getByRole('button', { name: 'Save workout' }));

    expect(await screen.findByText('Workout saved.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Push day' })).toBeInTheDocument();
    expect(screen.getByText('Bench press')).toBeInTheDocument();
    expect(screen.getByText('Felt explosive.')).toBeInTheDocument();
    expect(screen.getByText('60 kg')).toBeInTheDocument();
  });

  it('keeps entered values when saving fails', async () => {
    const user = userEvent.setup();
    const { client } = renderApp({ route: '/workouts/new' });
    client.failNextSave();

    await screen.findByLabelText('Title');
    await fillRequiredWorkoutFields(user);
    await user.click(screen.getByRole('button', { name: 'Save workout' }));

    expect(await screen.findByText('Could not save workout.')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Push day');
    expect(screen.getByLabelText('Exercise name')).toHaveValue('Bench press');
    expect(screen.getByLabelText('Set 1 reps')).toHaveValue(8);
    expect(screen.getByLabelText('Weight (kg)')).toHaveValue(60);
  });

  it('lists workouts newest first and opens details', async () => {
    const user = userEvent.setup();
    renderApp({
      workouts: [
        { ...squatWorkout, id: '1', date: '2026-10-10', title: 'Older session' },
        { ...squatWorkout, id: '2', date: '2026-10-18', title: 'Newest session' },
      ],
    });

    expect(await screen.findByRole('heading', { name: 'Newest session' })).toBeInTheDocument();
    const headings = screen.getAllByRole('heading').map((node) => node.textContent);
    expect(headings.indexOf('Newest session')).toBeLessThan(headings.indexOf('Older session'));

    await user.click(screen.getAllByRole('link', { name: 'View' })[0]);
    expect(await screen.findByRole('heading', { name: 'Newest session' })).toBeInTheDocument();
    expect(screen.getByText('Back squat')).toBeInTheDocument();
    expect(screen.getByText('85 kg')).toBeInTheDocument();
  });

  it('filters history by date', async () => {
    const user = userEvent.setup();
    renderApp({
      workouts: [
        { ...squatWorkout, id: '1', date: '2026-10-10', title: 'Early session' },
        { ...squatWorkout, id: '2', date: '2026-10-18', title: 'Later session' },
      ],
    });

    await screen.findByRole('heading', { name: 'Later session' });
    await user.type(screen.getByLabelText('From date'), '2026-10-18');
    await user.type(screen.getByLabelText('To date'), '2026-10-18');
    await user.click(screen.getByRole('button', { name: 'Apply dates' }));

    expect(await screen.findByRole('heading', { name: 'Later session' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Early session' })).not.toBeInTheDocument();
  });

  it('paginates long workout histories', async () => {
    const user = userEvent.setup();
    const workouts = Array.from({ length: 12 }, (_, index) => ({
      ...squatWorkout,
      id: String(index + 1),
      date: '2026-10-18',
      title: `Session ${String(index + 1).padStart(2, '0')}`,
      createdAt: `2026-10-18T12:00:${String(index).padStart(2, '0')}.000Z`,
    }));
    renderApp({ workouts });

    expect(await screen.findByText('Showing 10 of 12 workouts.')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Showing 2 of 12 workouts.')).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
  });

  it('populates the edit form and saves changes', async () => {
    const user = userEvent.setup();
    renderApp({
      route: '/workouts/10/edit',
      workouts: [squatWorkout],
    });

    expect(await screen.findByLabelText('Title')).toHaveValue('Lower body strength');
    expect(screen.getByLabelText('Exercise name')).toHaveValue('Back squat');
    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Updated squat day');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Workout updated.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Updated squat day' })).toBeInTheDocument();
  });

  it('deletes a workout after confirmation and updates history', async () => {
    const user = userEvent.setup();
    renderApp({
      route: '/workouts/10',
      workouts: [squatWorkout],
    });

    expect(await screen.findByRole('heading', { name: 'Lower body strength' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Delete workout' }));

    expect(await screen.findByText('Workout deleted.')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'No workouts yet' })).toBeInTheDocument();
  });

  it('renders user-supplied notes as text rather than HTML', async () => {
    renderApp({
      route: '/workouts/10',
      workouts: [
        {
          ...squatWorkout,
          notes: '<img src="x" alt="injected" />',
        },
      ],
    });

    expect(await screen.findByText('<img src="x" alt="injected" />')).toBeInTheDocument();
    expect(screen.queryByAltText('injected')).not.toBeInTheDocument();
  });

  it('lets a signed-in user open workout history from home', async () => {
    const user = userEvent.setup();
    const client = createMockClient({ user: sampleUser, workouts: [squatWorkout] });
    render(renderWithAuth(<App />, { client, route: '/' }));

    expect(await screen.findByText(/Signed in as/)).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Workout history' }));
    expect(await screen.findByRole('heading', { name: 'Lower body strength' })).toBeInTheDocument();
  });
});
