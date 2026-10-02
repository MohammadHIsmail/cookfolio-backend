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
  image: z.url().nullable().optional(),
  prepTime: z.number().int().positive().nullable().optional(),
  cookTime: z.number().int().positive().nullable().optional(),
  servings: z.number().int().positive().nullable().optional(),
  notes: z.string().min(1).max(255).nullable().optional(),
  cuisineId: z.uuid().nullable().optional(),
  categoryId: z.uuid().nullable().optional(),
  subcategoryId: z.uuid().nullable().optional(),
});

// PATCH-style updates: every field optional, but still validated when present.
const updateRecipeSchema = createRecipeSchema.partial();

// Query params for GET /recipes
const listRecipesSchema = z.object({
  // Sorting
  sortBy: z
    .enum(Object.keys(RECIPE_SORT_COLUMNS))
    .optional()
    .default('createdAt'),
  order: z
    .enum(Object.values(SORT_ORDERS))
    .optional()
    .default(SORT_ORDERS.DESC),

  // Filters
  cuisineId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  subcategoryId: z.string().uuid().optional(),
  ingredient: z.string().min(1).optional(),  // matched against ingredients[].name
  dateFrom: z.iso.datetime({ offset: true }).optional(),
  dateTo: z.iso.datetime({ offset: true }).optional(),

  // Pagination
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

module.exports = { createRecipeSchema, updateRecipeSchema, listRecipesSchema };