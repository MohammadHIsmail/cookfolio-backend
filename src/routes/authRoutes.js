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
const { OTP_PURPOSES, HTTP_STATUS } = require('../../constants')

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

module.exports = router;