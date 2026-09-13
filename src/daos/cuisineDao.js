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

async function create({name, userId}) {
  const client = await pool.connect();

  try {
    // 2. Start the transaction
    await client.query('BEGIN');

    // 3. Create the cuisine and grab its new ID
    const cuisineResult = await client.query(
      `INSERT INTO cuisines (name)
       VALUES ($1)
       RETURNING ${PUBLIC_CUISINE_COLUMNS}`,
      [name]
    );
    const newCuisine = cuisineResult.rows[0];

    // 4. Insert the connection into your pivot table
    await client.query(
      `INSERT INTO users_cuisines (user_id, cuisine_id)
       VALUES ($1, $2)`,
      [userId, newCuisine.id] // Uses the ID returned from the first query
    );

    // 5. Commit the transaction to save both records permanently
    await client.query('COMMIT');

    return newCuisine;
  } catch (error) {
    // 6. If anything goes wrong, undo everything to protect data integrity
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // 7. Always release the client back to the pool
    client.release();
  }
}

// TODO: confirm flow for deleting cuisine
async function remove(id) {
  await pool.query('DELETE FROM cuisines WHERE id = $1', [id]);
}

async function update(id, { name }) {
  const { rows } = await pool.query(
    `UPDATE cuisines
     SET name = COALESCE($2, name),
     WHERE id = $1
     RETURNING ${PUBLIC_CUISINE_COLUMNS}`,
    [id, name]
  );
  return rows[0] || null;
}

module.exports = { findPublicById, findAll, create, remove, update };