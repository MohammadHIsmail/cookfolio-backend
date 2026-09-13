const { HTTP_STATUS } = require('../../constants');

module.exports = function errorHandler(err, request, response, next) {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_ERROR;
  const message = err.isOperational ? err.message : 'Internal server error';

  if (!err.isOperational) console.error(err);

  response.status(statusCode).json({ message });
};