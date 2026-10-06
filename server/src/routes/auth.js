import { Router } from 'express';
import passport from 'passport';
import { User } from '../models/User.js';
import { parseLoginInput, parseRegisterInput } from '../validators/account.js';
import { AppError } from '../utils/AppError.js';
import { regenerateAndLogin, logoutAndClearSession } from '../utils/session.js';
import { findOrCreateGoogleUser } from '../services/googleAuth.js';
import { requireAuth } from '../middleware/auth.js';

const INVALID_CREDENTIALS = 'Invalid username/email or password.';

export function createAuthRouter({ config, cookieName, enableGoogleMock = false }) {
  const router = Router();

  router.get('/config', (_req, res) => {
    res.json({
      googleEnabled: config.googleEnabled,
      googleUnavailableMessage: config.googleEnabled
        ? null
        : 'Google sign-in is not configured. You can still register and log in with a username and password.',
    });
  });

  router.get('/csrf-token', (req, res, next) => {
    req.session.save((error) => {
      if (error) {
        next(error);
        return;
      }
      res.json({ csrfToken: req.session.csrfToken });
    });
  });

  router.get('/me', requireAuth, (req, res) => {
    res.json({ user: req.user.toPublicJSON(), csrfToken: req.session.csrfToken });
  });

  router.post('/register', async (req, res, next) => {
    try {
      const input = parseRegisterInput(req.body);
      const user = new User({
        name: input.name,
        email: input.email,
        username: input.username,
        authProvider: 'local',
      });
      await user.setPassword(input.password);
      await user.save();
      await regenerateAndLogin(req, user);
      res.status(201).json({ user: user.toPublicJSON(), csrfToken: req.session.csrfToken });
    } catch (error) {
      next(error);
    }
  });

  router.post('/login', async (req, res, next) => {
    try {
      const input = parseLoginInput(req.body);
      req.body.identifier = input.identifier;
      req.body.password = input.password;

      passport.authenticate('local', async (err, user) => {
        try {
          if (err) {
            next(err);
            return;
          }
          if (!user) {
            const existing = await User.findOne(
              input.looksLikeEmail ? { email: input.identifier } : { username: input.identifier }
            ).select('+passwordHash');
            if (existing && existing.authProvider === 'google' && !existing.passwordHash) {
              next(
                new AppError('This account uses Google sign-in. Continue with Google instead.', {
                  status: 401,
                  code: 'GOOGLE_ACCOUNT',
                })
              );
              return;
            }
            next(
              new AppError(INVALID_CREDENTIALS, {
                status: 401,
                code: 'INVALID_CREDENTIALS',
              })
            );
            return;
          }
          await regenerateAndLogin(req, user);
          res.json({ user: user.toPublicJSON(), csrfToken: req.session.csrfToken });
        } catch (inner) {
          next(inner);
        }
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  });

  router.post('/logout', requireAuth, async (req, res, next) => {
    try {
      await logoutAndClearSession(req, res, cookieName);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  router.get('/google', (req, res, next) => {
    if (!config.googleEnabled) {
      next(
        new AppError(
          'Google sign-in is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL to enable it.',
          { status: 503, code: 'GOOGLE_UNAVAILABLE' }
        )
      );
      return;
    }
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account',
    })(req, res, next);
  });

  router.get('/google/callback', (req, res, next) => {
    if (!config.googleEnabled) {
      res.redirect(`${config.frontendOrigin}/login?error=google_unavailable`);
      return;
    }

    passport.authenticate('google', { session: false }, async (err, user) => {
      const fail = (code) => {
        res.redirect(`${config.frontendOrigin}/login?error=${encodeURIComponent(code)}`);
      };

      if (err) {
        fail(err.code || 'GOOGLE_AUTH_FAILED');
        return;
      }
      if (!user) {
        fail('GOOGLE_AUTH_FAILED');
        return;
      }

      try {
        await regenerateAndLogin(req, user);
        res.redirect(`${config.frontendOrigin}/profile`);
      } catch {
        fail('GOOGLE_AUTH_FAILED');
      }
    })(req, res, next);
  });

  if (enableGoogleMock) {
    router.post('/google/mock', async (req, res, next) => {
      try {
        const user = await findOrCreateGoogleUser(req.body?.profile || {});
        await regenerateAndLogin(req, user);
        res.json({ user: user.toPublicJSON(), csrfToken: req.session.csrfToken });
      } catch (error) {
        next(error);
      }
    });
  }

  return router;
}
