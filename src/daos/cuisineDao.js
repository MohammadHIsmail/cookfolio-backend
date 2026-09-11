const pool = require('../../database/pool');

const PUBLIC_CUISINE_COLUMNS = `
  id,
  name,
`;

async function findPublicById(id) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_CUISINE_COLUMNS} FROM cuisines WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function findAll() {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_CUISINE_COLUMNS} FROM cuisines`
  );
  return rows || null;
}

// TODO: on create add to pivot table?
async function create({name, userId}) {
  const { rows } = await pool.query(
    `INSERT INTO cuisines (name)
     VALUES ($1)
     RETURNING ${PUBLIC_CUISINE_COLUMNS}`,
    [name]
  );
  return rows[0];
}

// TODO: confirm flow for deleting cuisine
async function remove(id) {
  await pool.query('DELETE FROM cuisines WHERE id = $1', [id]);
}

module.exports = { findPublicById, findAll, create, remove };