const { z } = require('zod');

const ingredientSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  unit: z.string().min(1),
});

const createRecipeSchema = z.object({
  name: z.string().min(1).max(255),
  ingredients: z.array(ingredientSchema).min(1),
  directions: z.string().min(1),
  image: z.string().z.url().nullable().optional(),
  prepTime: z.number().int().positive().nullable().optional(),
  cookTime: z.number().int().positive().nullable().optional(),
  servings: z.number().int().positive().nullable().optional(),
  cuisineId: z.string().z.uuid().nullable().optional(),
  categoryId: z.string().z.uuid().nullable().optional(),
  subcategoryId: z.string().z.uuid().nullable().optional(),
});

// PATCH-style updates: every field optional, but still validated when present.
const updateRecipeSchema = createRecipeSchema.partial();

module.exports = { createRecipeSchema, updateRecipeSchema };