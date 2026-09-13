const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

// app.js exports the Express app without calling .listen(), so supertest
// can bind it to its own ephemeral port per test run.
const app = require('../app');

test('GET /api/v1/book returns 200', async () => {
  const response = await request(app).get('/api/v1/book');
  assert.strictEqual(response.status, 200);
});