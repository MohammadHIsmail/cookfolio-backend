// src/services/otpService.js
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const otpDao = require('../daos/otpDao');
const emailService = require('./emailService');
const config = require('../../config');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../../constants');

// crypto.randomInt is cryptographically secure — Math.random() is NOT
// and must never be used to generate a credential.
function generateCode(length) {
  const max = 10 ** length;
  return String(crypto.randomInt(0, max)).padStart(length, '0');
}

async function issue(user, purpose) {
  const existing = await otpDao.findActive(user.id, purpose);

  // Resend cooldown: stops someone spamming the send endpoint
  // to flood an inbox or burn through your SMTP quota.
  if (existing) {
    const ageSeconds = (Date.now() - new Date(existing.createdAt).getTime()) / 1000;
    if (ageSeconds < config.otp.resendCooldownSeconds) {
      throw new AppError(
        `Please wait ${Math.ceil(config.otp.resendCooldownSeconds - ageSeconds)}s before requesting another code`,
        429
      );
    }
  }

  await otpDao.consumeAllForUser(user.id, purpose);

  const code = generateCode(config.otp.length);
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + config.otp.ttlMinutes * 60 * 1000);

  await otpDao.create({ userId: user.id, codeHash, purpose, expiresAt });

  // The plaintext code exists only here, in memory, on its way to the email.
  await emailService.sendOtp(user.email, user.name, code, config.otp.ttlMinutes);
}

async function verify(userId, purpose, code) {
  const otp = await otpDao.findActive(userId, purpose);
  if (!otp) throw new AppError('Invalid or expired code', HTTP_STATUS.BAD_REQUEST);

  if (new Date(otp.expiresAt) < new Date()) {
    await otpDao.markConsumed(otp.id);
    throw new AppError('Invalid or expired code', HTTP_STATUS.BAD_REQUEST);
  }

  if (otp.attempts >= config.otp.maxAttempts) {
    await otpDao.markConsumed(otp.id);
    throw new AppError('Too many attempts, request a new code', HTTP_STATUS.BAD_REQUEST);
  }

  const valid = await bcrypt.compare(code, otp.codeHash);
  if (!valid) {
    await otpDao.incrementAttempts(otp.id);
    throw new AppError('Invalid or expired code', HTTP_STATUS.BAD_REQUEST);
  }

  await otpDao.markConsumed(otp.id);
  return true;
}

module.exports = { issue, verify };