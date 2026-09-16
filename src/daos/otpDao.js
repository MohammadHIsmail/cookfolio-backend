// src/daos/otpDao.js
const pool = require('../../database/pool');

const OTP_COLUMNS = `
  id,
  user_id AS "userId",
  code_hash AS "codeHash",
  purpose,
  expires_at AS "expiresAt",
  consumed_at AS "consumedAt",
  attempts,
  created_at AS "createdAt"
`;

async function create({ userId, codeHash, purpose, expiresAt }) {
  const { rows } = await pool.query(
    `INSERT INTO otps (user_id, code_hash, purpose, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING ${OTP_COLUMNS}`,
    [userId, codeHash, purpose, expiresAt]
  );
  return rows[0];
}

// The most recent unconsumed code for this user + purpose.
async function findActive(userId, purpose) {
  const { rows } = await pool.query(
    `SELECT ${OTP_COLUMNS}
     FROM otps
     WHERE user_id = $1 AND purpose = $2 AND consumed_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId, purpose]
  );
  return rows[0] || null;
}

async function incrementAttempts(id) {
  const { rows } = await pool.query(
    `UPDATE otps SET attempts = attempts + 1
     WHERE id = $1
     RETURNING ${OTP_COLUMNS}`,
    [id]
  );
  return rows[0];
}

async function markConsumed(id) {
  await pool.query(
    `UPDATE otps SET consumed_at = now() WHERE id = $1`,
    [id]
  );
}

// Invalidate any outstanding codes before issuing a new one,
// so only the newest code is ever valid.
async function consumeAllForUser(userId, purpose) {
  await pool.query(
    `UPDATE otps SET consumed_at = now()
     WHERE user_id = $1 AND purpose = $2 AND consumed_at IS NULL`,
    [userId, purpose]
  );
}

module.exports = {
  create,
  findActive,
  incrementAttempts,
  markConsumed,
  consumeAllForUser,
};