/**
 * TEST PARTIAL  (src/templates/partials/tests-node.js)
 * Generates Jest + Supertest scaffold for Node.js adapters.
 * Tests are integration-level — hit actual routes.
 */
export function testFiles(_variant) {
  return {
    'jest.config.js': `export default {
  testEnvironment:    'node',
  transform:          {},
  coverageDirectory:  'coverage',
  collectCoverageFrom: ['src/**/*.js', '!src/index.js'],
};
`,
    'tests/health.test.js': `import request from 'supertest';
import app from '../src/app.js';

describe('Health', () => {
  it('GET /health -> 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
`,
    'tests/items.crud.test.js': `/**
 * CRUD integration tests — assumes an in-memory / test DB.
 * Set DATABASE_URL in .env.test to an isolated test database.
 */
import request from 'supertest';
import app     from '../src/app.js';

describe('Items CRUD', () => {
  let createdId;

  it('POST /api/v1/items  -> 201', async () => {
    const res = await request(app)
      .post('/api/v1/items')
      .send({ name: 'Scaffold test item', description: 'auto-generated' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('name', 'Scaffold test item');
    createdId = res.body.data._id || res.body.data.id;
  });

  it('GET  /api/v1/items  -> 200 array', async () => {
    const res = await request(app).get('/api/v1/items');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET  /api/v1/items/:id  -> 200', async () => {
    if (!createdId) return;
    const res = await request(app).get('/api/v1/items/' + createdId);
    expect(res.status).toBe(200);
  });

  it('PUT  /api/v1/items/:id  -> 200', async () => {
    if (!createdId) return;
    const res = await request(app)
      .put('/api/v1/items/' + createdId)
      .send({ name: 'Updated', description: 'updated' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('name', 'Updated');
  });

  it('DELETE /api/v1/items/:id  -> 204', async () => {
    if (!createdId) return;
    const res = await request(app).delete('/api/v1/items/' + createdId);
    expect(res.status).toBe(204);
  });
});
`,
  };
}
