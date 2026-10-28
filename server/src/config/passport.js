import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User.js';
import { findOrCreateGoogleUser } from '../services/googleAuth.js';
import { mongoUserId } from '../middleware/auth.js';

export function configurePassport(config) {
  passport.serializeUser((user, done) => {
    const id = mongoUserId(user);
    if (!id) {
      done(new Error('Cannot serialize a user without a database id.'));
      return;
    }
    done(null, id);
  }); // Session identity is always the Mongo user _id, never a Google profile id.

  passport.deserializeUser(async (id, done) => {
    try {
      if (!mongoUserId({ _id: id })) {
        done(null, false);
        return;
      }
      const user = await User.findById(id);
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });

  passport.use(
    new LocalStrategy(
      { usernameField: 'identifier', passwordField: 'password' },
      async (identifier, password, done) => {
        try {
          const looksLikeEmail = identifier.includes('@');
          const query = looksLikeEmail ? { email: identifier } : { username: identifier };
          const user = await User.findOne(query).select('+passwordHash');
          if (!user || !(await user.verifyPassword(password))) {
            done(null, false);
            return;
          }
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  if (config.googleEnabled) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.googleClientId,
          clientSecret: config.googleClientSecret,
          callbackURL: config.googleCallbackUrl,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const user = await findOrCreateGoogleUser(profile);
            done(null, user);
          } catch (error) {
            done(error);
          }
        }
      )
    );
  }

  return passport;
}
