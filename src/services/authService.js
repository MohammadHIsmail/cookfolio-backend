// src/services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userDao = require('../daos/userDao');
const config = require('../../config');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../../constants');

async function register({ email, password, name, username }) {
  const existing = await userDao.findByEmail(email);
  if (existing) throw new AppError('Email already in use', HTTP_STATUS.CONFLICT);

  const hashed = await bcrypt.hash(password, 12);
  return userDao.create({ email, password: hashed, name, username });
}

async function login({ email, password }) {
  const user = await userDao.findByEmail(email);
  if (!user) throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED);

  const token = jwt.sign({ sub: user.id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
  return { token };
}

async function updatePassword(userId, newPassword) {
  const hashed = await bcrypt.hash(newPassword, 12);
  await pool.query(
    `UPDATE users SET password = $1 WHERE id = $2`,
    [hashed, userId]
  );
}

module.exports = { register, login, updatePassword };