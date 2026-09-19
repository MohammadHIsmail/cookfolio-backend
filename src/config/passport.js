// src/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple');
const config = require('../../config');
const oauthService = require('../services/oauthService');
const { AUTH_PROVIDERS } = require('../../constants');

passport.use(
  new GoogleStrategy(
    {
      clientID: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
      callbackURL: config.oauth.google.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const result = await oauthService.handleOAuthCallback(
          {
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value || null,
          },
          AUTH_PROVIDERS.GOOGLE
        );
        done(null, result);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.use(
  new AppleStrategy(
    {
      clientID: config.oauth.apple.clientId,
      teamID: config.oauth.apple.teamId,
      keyID: config.oauth.apple.keyId,
      privateKey: config.oauth.apple.privateKey,
      callbackURL: config.oauth.apple.callbackUrl,
      passReqToCallback: false,
    },
    async (accessToken, refreshToken, idToken, profile, done) => {
      try {
        // Apple only sends name and email on the FIRST login.
        // After that, profile.name and profile.email may be empty —
        // your DB record from the first login is the source of truth.
        const result = await oauthService.handleOAuthCallback(
          {
            id: profile.id || profile.sub,
            email: profile.email,
            name: profile.name
              ? `${profile.name.firstName} ${profile.name.lastName}`.trim()
              : null,
            avatarUrl: null,  // Apple does not provide an avatar
          },
          AUTH_PROVIDERS.APPLE
        );
        done(null, result);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

module.exports = passport;