const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN || 'a9p.com.br';

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/auth/google/callback`,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user info from Google profile
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const name = profile.displayName;
        const picture = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        // Validate domain restriction
        if (!email || !email.endsWith(`@${ALLOWED_DOMAIN}`)) {
          return done(null, false, {
            message: `Acesso negado. Apenas emails do domínio @${ALLOWED_DOMAIN} são permitidos.`
          });
        }

        // Create user object to store in session
        const user = {
          id: profile.id,
          email,
          name,
          picture,
          provider: 'google'
        };

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
