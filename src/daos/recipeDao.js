const pool = require('../../database/pool');

const PUBLIC_RECIPES_COLUMNS = `
  id,
  name,
  ingredients,
  directions,
  image,
  prep_time AS "prepTime",
  cook_time AS "cookTime",
  servings,
  notes,
  cuisine_id AS "cuisineId",
  category_id AS "categoryId",
  subcategory_id AS "subcategoryId",
  is_favorite AS "isFavorite",
  deleted_at AS "deletedAt",
  created_at AS "createdAt"
`;

const RECIPE_COLUMNS = `
  r.id,
  r.name,
  r.ingredients,
  r.directions,
  r.image,
  r.prep_time AS "prepTime",
  r.cook_time AS "cookTime",
  r.servings,
  r.cuisine_id AS "cuisineId",
  r.category_id AS "categoryId",
  r.subcategory_id AS "subcategoryId",
  r.is_favorite AS "isFavorite",
  r.deleted_at AS "deletedAt",
  r.created_at AS "createdAt"
`;

async function findPublicById(id) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_RECIPES_COLUMNS} FROM recipes WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return rows[0] || null;
}

///Without sorting
// async function findAll() {
//   const { rows } = await pool.query(
//     `SELECT ${PUBLIC_RECIPES_COLUMNS} FROM recipes WHERE deleted_at IS NULL`
//   );
//   return rows || null;
// }

async function findAll({ sortBy, order, cuisineId, categoryId, subcategoryId, ingredient, dateFrom, dateTo, page, limit }) {
  const params = [];
  const conditions = ['r.deleted_at IS NULL'];

  // --- Filters ---

  if (cuisineId) {
    params.push(cuisineId);
    conditions.push(`r.cuisine_id = $${params.length}`);
  }

  if (categoryId) {
    params.push(categoryId);
    conditions.push(`r.category_id = $${params.length}`);
  }

  if (subcategoryId) {
    params.push(subcategoryId);
    conditions.push(`r.subcategory_id = $${params.length}`);
  }

  // JSONB ingredient search: checks if any element in the ingredients array
  // has a "name" field that contains the search string (case-insensitive).
  if (ingredient) {
    params.push(`%${ingredient.toLowerCase()}%`);
    conditions.push(
      `EXISTS (
        SELECT 1 FROM jsonb_array_elements(r.ingredients) AS ing
        WHERE lower(ing->>'name') LIKE $${params.length}
      )`
    );
  }

  if (dateFrom) {
    params.push(dateFrom);
    conditions.push(`r.created_at >= $${params.length}`);
  }

  if (dateTo) {
    params.push(dateTo);
    conditions.push(`r.created_at <= $${params.length}`);
  }

  // --- Sort ---
  // Column name comes from the constants map, never directly from user input.
  // Order direction is validated by Zod to be only 'asc' or 'desc'.
  const sortColumn = RECIPE_SORT_COLUMNS[sortBy] || RECIPE_SORT_COLUMNS.createdAt;
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // --- Pagination ---
  const offset = (page - 1) * limit;
  params.push(limit);
  const limitPlaceholder = `$${params.length}`;
  params.push(offset);
  const offsetPlaceholder = `$${params.length}`;

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Count query — same filters, no sort or pagination.
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM recipes r ${whereClause}`,
    params.slice(0, params.length - 2)   // exclude the limit + offset params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Data query
  const { rows } = await pool.query(
    `SELECT ${RECIPE_COLUMNS}
     FROM recipes r
     ${whereClause}
     ORDER BY ${sortColumn} ${sortOrder}
     LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    params
  );

  return {
    data: rows,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function create({ 
  name, 
  ingredients, 
  directions, 
  image, 
  prepTime, 
  cookTime, 
  servings, 
  notes, 
  cuisineId, 
  categoryId, 
  subcategoryId, 
  bookId }) {
  try {
    // 2. Start the transaction
    await client.query('BEGIN');

    // 3. Create the recipe and grab its new ID
    const recipeResult = await client.query(
      `INSERT INTO recipes (name, ingredients, directions, image, prep_time, cook_time, servings, notes, cuisine_id, category_id, subcategory_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING ${PUBLIC_RECIPES_COLUMNS}`,
      [name, ingredients, directions, image, prepTime, cookTime, servings, notes, cuisineId, categoryId, subcategoryId]
    );
    const newRecipe = recipeResult.rows[0];

    // 4. Insert the connection into your pivot table
    await client.query(
      `INSERT INTO books_recipes (book_id, recipe_id)
       VALUES ($1, $2)`,
      [bookId, newRecipe.id] // Uses the ID returned from the first query
    );

    // 5. Commit the transaction to save both records permanently
    await client.query('COMMIT');

    return newRecipe;
  } catch (error) {
    // 6. If anything goes wrong, undo everything to protect data integrity
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // 7. Always release the client back to the pool
    client.release();
  }
}

// TODO: confirm flow for deleting recipes
async function remove(id) {
  await pool.query(
    `UPDATE recipes
     SET deleted_at = NOW(),
     WHERE id = $1`,
    [id]
  );
}

async function toggleFavorite(id) {
  const { rows } = await pool.query(
    `UPDATE recipes
     SET is_favorite = NOT is_favorite,
     WHERE id = $1
     RETURNING ${PUBLIC_RECIPES_COLUMNS}`,
    [id]
  );
  return rows[0] || null;
}

async function update(id, { 
  name, 
  ingredients, 
  directions, 
  image, 
  prepTime, 
  cookTime, 
  servings, 
  notes, 
  cuisineId, 
  categoryId, 
  subcategoryId }) {
  const { rows } = await pool.query(
    `UPDATE recipes
     SET name = COALESCE($2, name),
         ingredients = COALESCE($3, ingredients),
         directions = COALESCE($4, directions),
         image = COALESCE($5, image),
         prep_time = COALESCE($6, prep_time),
         cook_time = COALESCE($7, cook_time),
         servings = COALESCE($8, servings),
         notes = COALESCE($9, notes),
         cuisine_id = COALESCE($10, cuisine_id),
         category_id = COALESCE($11, category_id),
         subcategory_id = COALESCE($12, subcategory_id),
     WHERE id = $1
     RETURNING ${PUBLIC_RECIPES_COLUMNS}`,
    [id, name, ingredients, directions, image, prepTime, cookTime, servings, notes, cuisineId, categoryId, subcategoryId]
  );
  return rows[0] || null;
}

// TODO: check for receiverId through email sent by checking if it exists first in the service file?
async function share(id, { senderId, receiverId }) {
  const { rows } = await pool.query(
    `INSERT INTO user_shares (user_id_shared_from, user_id_shared_to, recipe_id)
     VALUES ($2, $3, $1)
     RETURNING ${PUBLIC_BOOK_COLUMNS}`,//should there be a return
    [id, senderId, receiverId]
  );
  return rows[0] || null;
}

// TODO: create(?) bulk delete and bulk favorite and create share recipess ops (add/remove)

module.exports = { findPublicById, findAll, create, toggleFavorite, remove, update, share };