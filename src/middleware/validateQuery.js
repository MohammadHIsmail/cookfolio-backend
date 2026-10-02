module.exports = function validateQuery(schema) {
  return (request, response, next) => {
    const result = schema.safeParse(request.query);
    if (!result.success) {
      return response.status(400).json({ errors: result.error.flatten() });
    }
    // Replace request.query with the parsed + coerced + defaulted values
    // so the route handler and DAO receive clean types, not raw strings.
    request.query = result.data;
    next();
  };
};