// src/validators/authValidator.js
const { z } = require('zod');

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.email(),
  name: z.string().min(1).max(255),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const requestOtpSchema = z.object({
  email: z.email(),
});

const verifyOtpSchema = z.object({
  email: z.email(),
  code: z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
});

const resetPasswordSchema = z.object({
  email: z.email(),
  code: z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
  newPassword: z.string().min(8),
});

module.exports = {
  registerSchema,
  loginSchema,
  requestOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
};