// src/services/oauthService.js
const jwt = require('jsonwebtoken');
const userDao = require('../daos/userDao');
const config = require('../../config');
const { AUTH_PROVIDERS } = require('../../constants');

// Called by both Google and Apple strategies after the provider
// confirms the user's identity. Finds an existing user or creates
// a new one, then returns a JWT — same token shape as local login.
async function handleOAuthCallback(profile, provider) {
  const { id: providerId, email, name, avatarUrl } = profile;

  // 1. Check if we already have an account linked to this provider ID.
  let user =
    provider === AUTH_PROVIDERS.GOOGLE
      ? await userDao.findByGoogleId(providerId)
      : await userDao.findByAppleId(providerId);

  if (user) {
    return issueToken(user);
  }

  // 2. Check if an account exists for this email (user may have
  //    registered locally first, then tried OAuth).
  const existing = await userDao.findByEmail(email);
  if (existing) {
    // Link the OAuth provider to their existing account so they
    // can use either method next time.
    if (provider === AUTH_PROVIDERS.GOOGLE) {
      await userDao.linkGoogleId(existing.id, providerId);
    } else {
      await userDao.linkAppleId(existing.id, providerId);
    }
    return issueToken(existing);
  }

  // 3. Brand new user — create the account.
  user = await userDao.createOAuthUser({
    email,
    name,
    avatarUrl,
    googleId: provider === AUTH_PROVIDERS.GOOGLE ? providerId : null,
    appleId: provider === AUTH_PROVIDERS.APPLE ? providerId : null,
    provider,
  });

  return issueToken(user);
}

function issueToken(user) {
  const token = jwt.sign({ sub: user.id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
  return { token, user };
}

module.exports = { handleOAuthCallback };