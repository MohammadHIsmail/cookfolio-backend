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

async function findPublic() {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_RECIPES_COLUMNS} FROM recipes`
  );
  return rows || null;
}

// TODO: implement adding ids to books-recipes piviot table
async function create({ 
    name, 
    ingredients, 
    directions , 
    image , 
    prepTime , 
    cookTime , 
    servings , 
    cuisineId , 
    categoryId , 
    subcategoryId , 
    bookId }) {
  const { rows } = await pool.query(
    `INSERT INTO recipes (name, ingredients, directions, image, prep_time, cook_time, servings, cuisine_id, category_id, subcategory_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING ${PUBLIC_RECIPES_COLUMNS}`,
    [name, ingredients, directions, image, prepTime, cookTime, servings, cuisineId, categoryId, subcategoryId]
  );
  return rows[0];
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
     RETURNING ${PUBLIC_USER_COLUMNS}`,
    [id]
  );
  return rows[0] || null;
}

// TODO: create(?) bulk delete and bulk favorite and create share recipess ops (add/remove)

module.exports = { findPublicById, findPublic, create, toggleFavorite, remove };