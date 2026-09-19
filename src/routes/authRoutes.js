const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const authService = require('../services/authService');
const otpService = require('../services/otpService');
const userDao = require('../daos/userDao');
const validate = require('../middleware/validate');
const AppError = require('../utils/AppError');
const {
  registerSchema,
  loginSchema,
  requestOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} = require('../validators/authValidator');
const passport = require('passport');
const { OTP_PURPOSES, HTTP_STATUS } = require('../../constants');

const router = Router();

// Rate limiter applied to all OTP endpoints — 10 attempts per 15 minutes per IP.
// This is an IP-level defence; the per-user resend cooldown in otpService.issue()
// is a separate, complementary layer.
const otpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post('/register', validate(registerSchema), async (request, response, next) => {
  try {
    const user = await authService.register(request.body);
    response.status(HTTP_STATUS.CREATED).json(user);
  } catch (err) {
    next(err);
  }
});

router.post('/login', validate(loginSchema), async (request, response, next) => {
  try {
    const result = await authService.login(request.body);
    response.status(HTTP_STATUS.OK).json(result);
  } catch (err) {
    next(err);
  }
});

// --- OTP: email verification ---

// Step 1: user requests a code after registering.
// Always returns the same response whether or not the email exists —
// this prevents using the endpoint to discover which emails are registered.
router.post('/request-otp', otpLimiter, validate(requestOtpSchema), async (request, response, next) => {
  try {
    const user = await userDao.findByEmail(request.body.email);
    if (user) {
      await otpService.issue(user, OTP_PURPOSES.EMAIL_VERIFICATION);
    }
    // Same response whether or not the account exists, so this endpoint
    // can't be used to discover which emails are registered.
    response.status(HTTP_STATUS.OK).json({ message: 'If that account exists, a code has been sent' });
  } catch (err) {
    next(err);
  }
});

// Step 2: user submits the code they received.
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), async (request, response, next) => {
  try {
    const user = await userDao.findByEmail(request.body.email);
    if (!user) throw new AppError('Invalid or expired code', HTTP_STATUS.BAD_REQUEST);

    await otpService.verify(user.id, OTP_PURPOSES.EMAIL_VERIFICATION, request.body.code);
    await userDao.verify(user.id);

    response.status(HTTP_STATUS.OK).json({ message: 'Email verified' });
  } catch (err) {
    next(err);
  }
});

// --- OTP: password reset ---

// Step 1: user requests a reset code.
router.post(
  '/request-password-reset',
  otpLimiter,
  validate(requestOtpSchema),
  async (request, response, next) => {
    try {
      const user = await userDao.findByEmail(request.body.email);
      if (user) {
        await otpService.issue(user, OTP_PURPOSES.PASSWORD_RESET);
      }
      response.status(HTTP_STATUS.OK).json({
        message: 'If that account exists, a reset code has been sent',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Step 2: user submits the code + their new password in one request.
router.post(
  '/reset-password',
  otpLimiter,
  validate(resetPasswordSchema),
  async (request, response, next) => {
    try {
      const user = await userDao.findByEmail(request.body.email);
      if (!user) throw new AppError('Invalid or expired code', HTTP_STATUS.BAD_REQUEST);

      await otpService.verify(user.id, OTP_PURPOSES.PASSWORD_RESET, request.body.code);
      await authService.updatePassword(user.id, request.body.newPassword);

      response.status(HTTP_STATUS.OK).json({ message: 'Password reset successfully' });
    } catch (err) {
      next(err);
    }
  }
);

// --- Google OAuth ---

// Step 1: redirect the user to Google's consent screen.
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Step 2: Google redirects back here after the user consents.
// Passport runs the GoogleStrategy callback, which calls oauthService,
// which returns { token, user } as req.user.
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: config.oauth.failureRedirect }),
  (request, response) => {
    // For a mobile/SPA client: redirect with the token in the URL
    // so the client can extract it and store it.
    // For a server-rendered app: set a session cookie instead.
    const { token } = request.user;
    response.redirect(`${config.oauth.successRedirect}?token=${token}`);
  }
);

// --- Apple OAuth ---

// Step 1: redirect to Apple's consent screen.
router.get(
  '/apple',
  passport.authenticate('apple', { session: false })
);

// Step 2: Apple POSTs back (not GET — Apple uses POST for its callback).
router.post(
  '/apple/callback',
  passport.authenticate('apple', { session: false, failureRedirect: config.oauth.failureRedirect }),
  (request, response) => {
    const { token } = request.user;
    response.redirect(`${config.oauth.successRedirect}?token=${token}`);
  }
);

module.exports = router;