const pool = require('../../database/pool');

const PUBLIC_BOOK_COLUMNS = `
  id,
  name,
  image,
  is_favorite AS "isFavorite",
  deleted_at AS "deletedAt",
  user_id AS "owner",
  created_at AS "createdAt"
`;

async function findPublicById(id) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_BOOK_COLUMNS} FROM books WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function findAll() {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_BOOK_COLUMNS} FROM books`
  );
  return rows || null;
}
 
async function create({ name, image, userId }) {
  const { rows } = await pool.query(
    `INSERT INTO books (name, image, user_id)
     VALUES ($1, $2, $3)
     RETURNING ${PUBLIC_BOOK_COLUMNS}`,
    [name, image, userId]
  );
  return rows[0];
}

// TODO: confirm flow for deleting books
async function remove(id) {
  await pool.query(
    `UPDATE books
     SET deleted_at = NOW(),
     WHERE id = $1`,
    [id]
  );
}

async function toggleFavorite(id) {
  const { rows } = await pool.query(
    `UPDATE books
     SET is_favorite = NOT is_favorite,
     WHERE id = $1
     RETURNING ${PUBLIC_BOOK_COLUMNS}`,
    [id]
  );
  return rows[0] || null;
}

async function update(id, { name, image }) {
  const { rows } = await pool.query(
    `UPDATE books
     SET name = COALESCE($2, name),
         image = COALESCE($3, image),
     WHERE id = $1
     RETURNING ${PUBLIC_BOOK_COLUMNS}`,
    [id, name, image]
  );
  return rows[0] || null;
}

// TODO: create(?) bulk delete and bulk favorite & create share books ops (add/remove)

module.exports = { findPublicById, findAll, create, toggleFavorite, remove, update };