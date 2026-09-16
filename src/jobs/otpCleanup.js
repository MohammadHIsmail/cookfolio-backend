const cron = require('node-cron');
const pool = require('../../database/pool');
const logger = require('../utils/logger');

// Runs every day at 03:00.
cron.schedule('0 3 * * *', async () => {
  try {
    const result = await pool.query(
      `DELETE FROM otps
       WHERE
         consumed_at IS NOT NULL
         OR expires_at < now() - INTERVAL '7 days'`
    );
    logger.info({ deletedRows: result.rowCount }, 'OTP cleanup complete');
  } catch (err) {
    logger.error({ err }, 'OTP cleanup failed');
  }
});