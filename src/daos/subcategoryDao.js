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

async function findAll() {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_SUBCATEGORY_COLUMNS} FROM subcategories`
  );
  return rows || null;
}

async function create({name, userId}) {
  // 1. Get a dedicated client from the pool to run a multi-step transaction
  const client = await pool.connect();

  try {
    // 2. Start the transaction
    await client.query('BEGIN');

    // 3. Create the subcategory and grab its new ID
    const subcategoryResult = await client.query(
      `INSERT INTO subcategories (name)
       VALUES ($1)
       RETURNING ${PUBLIC_SUBCATEGORY_COLUMNS}`,
      [name]
    );
    const newSubcategory = subcategoryResult.rows[0];

    // 4. Insert the connection into your pivot table
    await client.query(
      `INSERT INTO users_subcategories (user_id, subcategory_id)
       VALUES ($1, $2)`,
      [userId, newSubcategory.id] // Uses the ID returned from the first query
    );

    // 5. Commit the transaction to save both records permanently
    await client.query('COMMIT');

    return newSubcategory;
  } catch (error) {
    // 6. If anything goes wrong, undo everything to protect data integrity
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // 7. Always release the client back to the pool
    client.release();
  }
}

// TODO: confirm flow for deleting category
async function remove(id) {
  await pool.query('DELETE FROM subcategories WHERE id = $1', [id]);
}

async function update(id, { name }) {
  const { rows } = await pool.query(
    `UPDATE subcategories
     SET name = COALESCE($2, name),
     WHERE id = $1
     RETURNING ${PUBLIC_SUBCATEGORY_COLUMNS}`,
    [id, name]
  );
  return rows[0] || null;
}

module.exports = { findPublicById, findAll, create, remove, update };