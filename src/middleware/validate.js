module.exports = function validate(schema) {
  return (request, response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      return response.status(400).json({ errors: result.error.flatten() });
    }
    request.body = result.data;
    next();
  };
};