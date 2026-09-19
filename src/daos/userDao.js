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

async function findByGoogleId(googleId) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE google_id = $1`,
    [googleId]
  );
  return rows[0] || null;
}

async function findByAppleId(appleId) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE apple_id = $1`,
    [appleId]
  );
  return rows[0] || null;
}

async function createOAuthUser({ email, name, avatarUrl, googleId, appleId, provider }) {
  const { rows } = await pool.query(
    `INSERT INTO users
       (email, name, avatar_url, google_id, apple_id, auth_provider, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6, true)
     RETURNING ${PUBLIC_USER_COLUMNS}`,
    [email, name, avatarUrl, googleId || null, appleId || null, provider]
  );
  return rows[0];
}

async function linkGoogleId(userId, googleId) {
  await pool.query(
    `UPDATE users SET google_id = $1 WHERE id = $2`,
    [googleId, userId]
  );
}

async function linkAppleId(userId, appleId) {
  await pool.query(
    `UPDATE users SET apple_id = $1 WHERE id = $2`,
    [appleId, userId]
  );
}

async function verify(id) {
  await pool.query(`UPDATE users SET is_verified = true WHERE id = $1`, [id]);
}

// TODO: confirm flow for deleting users
async function remove(id) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

module.exports = { findByEmail, findPublicById, create, verify, remove, findByGoogleId, findByAppleId, createOAuthUser, linkGoogleId, linkAppleId };