const pool = require('../../database/pool');

const PUBLIC_USER_COLUMNS = `
  id,
  username,
  email,
  name,
  is_verified AS "isVerified",
  created_at AS "createdAt"
`;

async function findByEmail(email) {
  // Includes the password hash — used only inside authService for login checks.
  const { rows } = await pool.query(
    `SELECT id, email, password, name FROM users WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
}

async function findPublicById(id) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ email, password, name, username }) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password, name, username)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PUBLIC_USER_COLUMNS}`,
    [email, password, name, username]
  );
  return rows[0];
}

// TODO: check proper flow to verify by OTP where might need to send OTP value as well
// async function verify(email) {
//   const { rows } = await pool.query(
//     `UPDATE users
//      SET is_verified = TRUE,
//      WHERE email = $1
//      RETURNING ${PUBLIC_USER_COLUMNS}`,
//     [email]
//   );
//   return rows[0] || null;
// }

async function verify(id) {
  await pool.query(`UPDATE users SET is_verified = true WHERE id = $1`, [id]);
}

// TODO: confirm flow for deleting users
async function remove(id) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

module.exports = { findByEmail, findPublicById, create, verify, remove };