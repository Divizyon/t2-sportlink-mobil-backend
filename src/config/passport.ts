import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as InstagramStrategy } from 'passport-instagram';
import { config } from './config';
import { User } from '../types/user';

// Google OAuth Strategy
if (config.google.clientId && config.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: `${config.baseUrl}${config.apiPrefix}/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user: User = {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            provider: 'google',
            photoUrl: profile.photos?.[0]?.value,
          };
          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// Instagram OAuth Strategy
if (config.instagram.clientId && config.instagram.clientSecret) {
  passport.use(
    new InstagramStrategy(
      {
        clientID: config.instagram.clientId,
        clientSecret: config.instagram.clientSecret,
        callbackURL: `${config.baseUrl}${config.apiPrefix}/auth/instagram/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user: User = {
            id: profile.id,
            name: profile.displayName,
            provider: 'instagram',
            photoUrl: profile._json?.data?.profile_picture,
          };
          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done) => {
  done(null, obj as User);
});

export default passport;
