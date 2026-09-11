const pool = require('../../database/pool');

const PUBLIC_SUBCATEGORY_COLUMNS = `
  id,
  name,
`;

async function findPublicById(id) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_SUBCATEGORY_COLUMNS} FROM subcategories WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function findPublic() {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_SUBCATEGORY_COLUMNS} FROM subcategories`
  );
  return rows || null;
}

// TODO: on create add to pivot table?
async function create({name}) {
  const { rows } = await pool.query(
    `INSERT INTO subcategories (name)
     VALUES ($1)
     RETURNING ${PUBLIC_SUBCATEGORY_COLUMNS}`,
    [name]
  );
  return rows[0];
}

// TODO: confirm flow for deleting category
async function remove(id) {
  await pool.query('DELETE FROM subcategories WHERE id = $1', [id]);
}

module.exports = { findPublicById, findPublic, create, remove };