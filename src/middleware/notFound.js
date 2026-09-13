module.exports = function notFound(request, response, next) {
  response.status(404).json({ message: `Route ${request.originalUrl} not found` });
};