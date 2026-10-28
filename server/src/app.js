import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { getConfig } from './config/env.js';
import { configurePassport } from './config/passport.js';
import { createAuthRouter } from './routes/auth.js';
import { createProfileRouter } from './routes/profile.js';
import { createWorkoutRouter } from './routes/workouts.js';
import { createSessionRouter } from './routes/sessions.js';
import { createCalendarRouter } from './routes/calendar.js';
import { createProgressRouter } from './routes/progress.js';
import { ensureCsrfToken, requireCsrf } from './middleware/csrf.js';
import { createAuthLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const COOKIE_NAME = 'ft.sid';

export function createApp({
  config = getConfig(),
  sessionStore,
  enableGoogleMock = false,
} = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.isProduction ? 1 : 0);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(
    cors({
      origin: config.frontendOrigin,
      credentials: true,
    })
  );

  app.use(express.json({ limit: '64kb' }));
  app.use(express.urlencoded({ extended: false }));

  const store =
    sessionStore ||
    MongoStore.create({
      mongoUrl: config.mongoUri,
      collectionName: 'sessions',
      ttl: 60 * 60 * 24 * 7,
    });

  app.use(
    session({
      name: COOKIE_NAME,
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      store,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.isProduction,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  configurePassport(config);
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(ensureCsrfToken);
  app.use(requireCsrf);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  const authLimiter = createAuthLimiter({ enabled: !config.isTest });
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/google', authLimiter);

  app.use(
    '/api/auth',
    createAuthRouter({
      config,
      cookieName: COOKIE_NAME,
      enableGoogleMock,
    })
  );
  app.use('/api/profile', createProfileRouter());
  app.use('/api/workouts', createWorkoutRouter());
  app.use('/api/sessions', createSessionRouter());
  app.use('/api/calendar', createCalendarRouter());
  app.use('/api/progress', createProgressRouter());

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export { COOKIE_NAME };
