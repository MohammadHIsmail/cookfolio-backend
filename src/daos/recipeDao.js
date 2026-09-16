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

async function findPublicById(id) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_RECIPES_COLUMNS} FROM recipes WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function findAll() {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_RECIPES_COLUMNS} FROM recipes`
  );
  return rows || null;
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