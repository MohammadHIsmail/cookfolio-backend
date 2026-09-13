const jwt = require('jsonwebtoken');
const config = require('../../config');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../../constants');

module.exports = function authenticate(request, response, next) {
  const header = request.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Missing or invalid token', HTTP_STATUS.UNAUTHORIZED));
  }
  try {
    const payload = jwt.verify(header.split(' ')[1], config.jwt.secret);
    request.user = { id: payload.sub };
    next();
  } catch {
    next(new AppError('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED));
  }
};