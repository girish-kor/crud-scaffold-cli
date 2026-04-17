/**
 * TEMPLATE ADAPTER: Node.js / Fastify  (src/templates/nodejs/fastify.js)
 * Identical manifest contract to the Express adapter — proves pluggability.
 * Uses Fastify's plugin model instead of Express middleware chains.
 */
import { dbConfig } from '../partials/db-config.js';
import { authFiles } from '../partials/auth.js';
import { dockerFiles } from '../partials/docker.js';
import { envFiles } from '../partials/env.js';
import { testFiles } from '../partials/tests-node.js';

export async function fastifyAdapter(config) {
  const db = dbConfig('nodejs', config.db);

  const files = {
    'package.json': buildPackageJson(db),
    'src/index.js': srcIndex(),
    'src/app.js': srcApp(),
    'src/config/index.js': configIndex(),
    'src/config/database.js': db.configFile,
    'src/routes/items.js': itemRoutes(),
    'src/controllers/item.controller.js': itemController(),
    'src/services/item.service.js': itemService(),
    'src/models/item.model.js': db.modelFile,
    'src/plugins/error-handler.js': errorPlugin(),
    'src/utils/response.js': responseUtil(),
    'src/utils/logger.js': loggerUtil(),
    'README.md': readme(),
    ...envFiles(config),
    ...(config.auth ? authFiles('nodejs', 'fastify') : {}),
    ...(config.docker ? dockerFiles('nodejs', 'fastify') : {}),
    ...(config.test ? testFiles('fastify') : {}),
  };

  return {
    files,
    installCommand: 'npm install',
    defaultPort: 3000,
    vars: { dbPackage: db.packageName },
  };
}

function buildPackageJson(db) {
  return `{
  "name": "<%= projectName %>",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev":   "nodemon src/index.js"<% if (includeTests) { %>,
    "test":  "tap"<% } %>
  },
  "dependencies": {
    "fastify":           "^4.24.3",
    "@fastify/cors":     "^8.4.0",
    "@fastify/helmet":   "^11.1.1",
    "dotenv":            "^16.3.1",
    ${JSON.stringify(db.packageName)}: ${JSON.stringify(db.packageVersion)}<% if (includeAuth) { %>,
    "@fastify/jwt":      "^8.0.0"<% } %>
  },
  "devDependencies": {
    "nodemon": "^3.0.2"<% if (includeTests) { %>,
    "tap":     "^16.3.10"<% } %>
  }
}`;
}

function srcIndex() {
  return `import { buildApp }  from './app.js';
import { config }      from './config/index.js';

const start = async () => {
  const app = await buildApp();
  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
`;
}

function srcApp() {
  return `import Fastify        from 'fastify';
import cors           from '@fastify/cors';
import helmet         from '@fastify/helmet';
import { itemRoutes }   from './routes/items.js';
import { errorPlugin }  from './plugins/error-handler.js';
import { connectDb }    from './config/database.js';

export async function buildApp() {
  const app = Fastify({ logger: { level: 'info' } });

  await connectDb();

  await app.register(cors);
  await app.register(helmet, { global: true });
  await app.register(errorPlugin);
  await app.register(itemRoutes, { prefix: '/api/v1/items' });

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}
`;
}

function configIndex() {
  return `import 'dotenv/config';
export const config = {
  port:      parseInt(process.env.PORT   || '3000', 10),
  dbUri:     process.env.DATABASE_URL    || '',
  jwtSecret: process.env.JWT_SECRET      || 'change-me-in-production',
};
`;
}

function itemRoutes() {
  return `import {
  getItems, getItem, createItem, updateItem, deleteItem,
} from '../controllers/item.controller.js';

const createSchema = {
  body: {
    type: 'object', required: ['name'],
    properties: {
      name:        { type: 'string', minLength: 1 },
      description: { type: 'string' },
    },
  },
};

export async function itemRoutes(fastify) {
  fastify.get('/',       getItems);
  fastify.get('/:id',    getItem);
  fastify.post('/',      { schema: createSchema }, createItem);
  fastify.put('/:id',    { schema: createSchema }, updateItem);
  fastify.delete('/:id', deleteItem);
}
`;
}

function itemController() {
  return `import { ItemService } from '../services/item.service.js';
const svc = new ItemService();

export const getItems   = async (req)      => svc.findAll(req.query);
export const getItem    = async (req, rep) => {
  const item = await svc.findById(req.params.id);
  if (!item) return rep.code(404).send({ error: 'Not found' });
  return item;
};
export const createItem = async (req, rep) => { rep.code(201); return svc.create(req.body); };
export const updateItem = async (req, rep) => {
  const item = await svc.update(req.params.id, req.body);
  if (!item) return rep.code(404).send({ error: 'Not found' });
  return item;
};
export const deleteItem = async (req, rep) => {
  await svc.remove(req.params.id);
  rep.code(204).send();
};
`;
}

function itemService() {
  return `import { Item } from '../models/item.model.js';
export class ItemService {
  findAll(q)      { return Item.find(q); }
  findById(id)    { return Item.findById(id); }
  create(data)    { return Item.create(data); }
  update(id, data){ return Item.findByIdAndUpdate(id, data, { new: true }); }
  remove(id)      { return Item.findByIdAndDelete(id); }
}
`;
}

function errorPlugin() {
  return `export async function errorPlugin(fastify) {
  fastify.setErrorHandler((err, req, rep) => {
    fastify.log.error(err);
    rep.status(err.statusCode || 500).send({
      success: false,
      error: { message: err.message },
    });
  });
}
`;
}

function responseUtil() {
  return `export const ok    = (data) => ({ success: true,  data });
export const fail  = (msg)  => ({ success: false, error: { message: msg } });
`;
}

function loggerUtil() {
  return `// Fastify ships with pino — use fastify.log in plugins/routes.
// This shim exists for utilities that need logging outside Fastify context.
const RESET = '\u001b[0m';
const CYAN  = '\u001b[36m';
const RED   = '\u001b[31m';
export const logger = {
  info:  (...a) => console.log(CYAN  + '[INFO] ' + RESET + a.join(' ')),
  error: (...a) => console.error(RED + '[ERR]  ' + RESET + a.join(' ')),
};
`;
}

function readme() {
  return `# <%= projectName %>

> Scaffolded by **crud-scaffold** — Fastify / <%= db %>

## Quick Start
\`\`\`bash
cp .env.example .env
npm run dev
\`\`\`

## API  \`/api/v1/items\`
GET / · GET /:id · POST / · PUT /:id · DELETE /:id
`;
}
