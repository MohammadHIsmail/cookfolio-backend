const { z } = require('zod');

const createBookSchema = z.object({
  name: z.string().min(1).max(255),
  image: z.url().nullable().optional(),
});

// PATCH-style updates: every field optional, but still validated when present.
const updateBookSchema = createBookSchema.partial();

module.exports = { createBookSchema, updateBookSchema };