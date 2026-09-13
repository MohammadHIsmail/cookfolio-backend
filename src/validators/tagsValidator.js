const { z } = require('zod');

const tagsSchema = z.object({
  name: z.string().min(1).max(255),
});

module.exports = { tagsSchema };