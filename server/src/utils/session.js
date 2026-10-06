import crypto from 'node:crypto';

export function createCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function regenerateAndLogin(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((regenErr) => {
      if (regenErr) {
        reject(regenErr);
        return;
      }
      req.session.csrfToken = createCsrfToken();
      req.login(user, (loginErr) => {
        if (loginErr) {
          reject(loginErr);
          return;
        }
        req.session.save((saveErr) => {
          if (saveErr) reject(saveErr);
          else resolve();
        });
      });
    });
  });
}

export function logoutAndClearSession(req, res, cookieName) {
  return new Promise((resolve, reject) => {
    const finish = () => {
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          reject(destroyErr);
          return;
        }
        res.clearCookie(cookieName);
        resolve();
      });
    };

    if (typeof req.logout === 'function') {
      req.logout((logoutErr) => {
        if (logoutErr) {
          reject(logoutErr);
          return;
        }
        finish();
      });
    } else {
      finish();
    }
  });
}
