import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from '../App.jsx';
import { createMockClient, renderWithAuth } from './testUtils.jsx';
import { RegisterPage } from '../pages/RegisterPage.jsx';
import { GuestRoute } from '../components/ProtectedRoute.jsx';

describe('S1-02 registration interface', () => {
  it('shows accessible fields, inline validation, login link, and unavailable Google state', async () => {
    const user = userEvent.setup();
    const client = createMockClient();
    render(
      renderWithAuth(
        <Routes>
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
        </Routes>,
        { client, route: '/register' }
      )
    );

    expect(await screen.findByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeDisabled();
    expect(screen.getByText(/Google sign-in is not configured/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
    expect(client.calls.find((call) => call[0] === 'register')).toBeUndefined();
  });
});

describe('S1-09 frontend registration → profile → logout → login flow', () => {
  it('creates an account, shows the profile, logs out, then logs back in', async () => {
    const user = userEvent.setup();
    const client = createMockClient();
    render(renderWithAuth(<App />, { client, route: '/register' }));

    await screen.findByLabelText('Name');
    await user.type(screen.getByLabelText('Name'), 'Alex Runner');
    await user.type(screen.getByLabelText('Email'), 'alex@example.com');
    await user.type(screen.getByLabelText('Username'), 'alexrunner');
    await user.type(screen.getByLabelText('Password'), 'Secure123');
    await user.type(screen.getByLabelText('Confirm password'), 'Secure123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('heading', { name: 'Your profile' })).toBeInTheDocument();
    expect(screen.getByText('alex@example.com')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Alex Updated');
    await user.click(screen.getByRole('button', { name: 'Save profile' }));
    expect(await screen.findByText('Profile saved.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Log out' }));
    expect(await screen.findByRole('heading', { name: 'Welcome to FitTrack' })).toBeInTheDocument();
    await user.click(screen.getAllByRole('link', { name: 'Sign in' })[0]);
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Username or email'), 'alexrunner');
    await user.type(screen.getByLabelText('Password'), 'Secure123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('heading', { name: 'Your profile' })).toBeInTheDocument();
  });

  it('lets guests sign in from home and signed-in users open profile or log out', async () => {
    const user = userEvent.setup();
    const client = createMockClient();
    render(renderWithAuth(<App />, { client, route: '/' }));

    expect(await screen.findByRole('heading', { name: 'Welcome to FitTrack' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Sign in' }).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('link', { name: 'Create an account' }));
    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
  });

  it('lets a signed-in user open their profile from home', async () => {
    const user = userEvent.setup();
    const client = createMockClient({
      user: {
        id: '1',
        name: 'Alex Runner',
        email: 'alex@example.com',
        username: 'alexrunner',
        authProvider: 'local',
        heightCm: null,
        weightKg: null,
        fitnessGoal: '',
      },
    });
    render(renderWithAuth(<App />, { client, route: '/' }));

    expect(await screen.findByText(/Signed in as/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Go to profile' }));
    expect(await screen.findByRole('heading', { name: 'Your profile' })).toBeInTheDocument();
  });

  it('shows a generic error for a wrong password', async () => {
    const user = userEvent.setup();
    const client = createMockClient();
    render(renderWithAuth(<App />, { client, route: '/login' }));

    await screen.findByLabelText('Username or email');
    await user.type(screen.getByLabelText('Username or email'), 'alexrunner');
    await user.type(screen.getByLabelText('Password'), 'Nope1234');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid username/email or password.')).toBeInTheDocument();
  });
});
