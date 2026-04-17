/**
 * TEMPLATE ADAPTER: Node.js / Express  (src/templates/nodejs/express.js)
 * ──────────────────────────────────────────────────────────────────────────────
 * Returns a manifest:  { files: { [relPath]: string }, installCommand, defaultPort, vars }
 * All string values are EJS templates — variables are injected by the generator.
 *
 * Layer architecture enforced in generated code:
 *   routes → controllers → services → models
 *   config, middleware, utils as orthogonal concerns
 * ──────────────────────────────────────────────────────────────────────────────
 */
import { dbConfig } from '../partials/db-config.js';
import { authFiles } from '../partials/auth.js';
import { dockerFiles } from '../partials/docker.js';
import { envFiles } from '../partials/env.js';
import { testFiles } from '../partials/tests-node.js';

export async function expressAdapter(config) {
  const db = dbConfig('nodejs', config.db);

  const files = {
    // ── Manifest ──────────────────────────────────────────────────────────
    'package.json': buildPackageJson(db),
    // ── Entry + App ───────────────────────────────────────────────────────
    'src/index.js': srcIndex(),
    'src/app.js': srcApp(),
    // ── Config ────────────────────────────────────────────────────────────
    'src/config/index.js': configIndex(),
    'src/config/database.js': db.configFile,
    // ── Routes ────────────────────────────────────────────────────────────
    'src/routes/index.js': routesIndex(),
    'src/routes/item.routes.js': itemRoutes(),
    // ── Controllers (HTTP boundary only — no business logic) ──────────────
    'src/controllers/item.controller.js': itemController(),
    // ── Services (all business logic lives here) ──────────────────────────
    'src/services/item.service.js': itemService(),
    // ── Models (data layer) ───────────────────────────────────────────────
    'src/models/item.model.js': db.modelFile,
    // ── Middleware ────────────────────────────────────────────────────────
    'src/middleware/error.middleware.js': errorMiddleware(),
    'src/middleware/validate.middleware.js': validateMiddleware(),
    // ── Utils ─────────────────────────────────────────────────────────────
    'src/utils/response.js': responseUtil(),
    'src/utils/logger.js': loggerUtil(),
    // ── Docs ──────────────────────────────────────────────────────────────
    'README.md': readme(),
    // ── Shared partials (env, docker, auth, tests) ────────────────────────
    ...envFiles(config),
    ...(config.auth ? authFiles('nodejs', 'express') : {}),
    ...(config.docker ? dockerFiles('nodejs', 'express') : {}),
    ...(config.test ? testFiles('express') : {}),
  };

  return {
    files,
    installCommand: 'npm install',
    defaultPort: 3000,
    vars: { dbPackage: db.packageName },
  };
}

// ── Template functions — return EJS strings ───────────────────────────────────

function buildPackageJson(db) {
  // ${...} here is JS template literal interpolation — resolved when adapter runs,
  // before EJS processes the result.  EJS tags (<%= %>) are resolved by generator.
  return `{
  "name": "<%= projectName %>",
  "version": "1.0.0",
  "description": "CRUD REST API — Express / <%= db %>",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev":   "nodemon src/index.js",
    "lint":  "eslint src/"<% if (includeTests) { %>,
    "test":  "jest --coverage"<% } %>
  },
  "dependencies": {
    "express":    "^4.18.2",
    "cors":       "^2.8.5",
    "helmet":     "^7.1.0",
    "morgan":     "^1.10.0",
    "dotenv":     "^16.3.1",
    "joi":        "^17.11.0",
    ${JSON.stringify(db.packageName)}: ${JSON.stringify(db.packageVersion)}<% if (includeAuth) { %>,
    "jsonwebtoken": "^9.0.2",
    "bcryptjs":     "^2.4.3"<% } %>
  },
  "devDependencies": {
    "nodemon": "^3.0.2"<% if (includeTests) { %>,
    "jest":    "^29.7.0",
    "supertest":"^6.3.4"<% } %>
  }
}`;
}

function srcIndex() {
  return `import app           from './app.js';
import { config }    from './config/index.js';
import { connectDb } from './config/database.js';
import { logger }    from './utils/logger.js';

const start = async () => {
  try {
    await connectDb();
    app.listen(config.port, () =>
      logger.info('Express server running on port ' + config.port + ' [<%= variant %>/<%= db %>]')
    );
  } catch (err) {
    logger.error('Fatal startup error: ' + err.message);
    process.exit(1);
  }
};

start();
`;
}

function srcApp() {
  return `import express            from 'express';
import cors               from 'cors';
import helmet             from 'helmet';
import morgan             from 'morgan';
import { router }         from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', router);
app.get('/health', (_req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// Error handler must be last middleware
app.use(errorMiddleware);

export default app;
`;
}

function configIndex() {
  return `import 'dotenv/config';

export const config = {
  port:      parseInt(process.env.PORT || '3000', 10),
  nodeEnv:   process.env.NODE_ENV   || 'development',
  dbUri:     process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
};
`;
}

function routesIndex() {
  return `import { Router }   from 'express';
import itemRoutes    from './item.routes.js';
<% if (includeAuth) { %>import authRoutes    from './auth.routes.js';<% } %>

export const router = Router();

router.use('/items', itemRoutes);
<% if (includeAuth) { %>router.use('/auth',  authRoutes);<% } %>
`;
}

function itemRoutes() {
  return `import { Router } from 'express';
import {
  getItems, getItem, createItem, updateItem, deleteItem,
} from '../controllers/item.controller.js';
import { validate }     from '../middleware/validate.middleware.js';
import { itemSchema }   from '../models/item.model.js';
<% if (includeAuth) { %>import { authenticate } from '../middleware/auth.middleware.js';<% } %>

const router = Router();

<% if (includeAuth) { %>// All item routes are protected
router.use(authenticate);
<% } %>
router.get('/',       getItems);
router.get('/:id',    getItem);
router.post('/',      validate(itemSchema), createItem);
router.put('/:id',    validate(itemSchema), updateItem);
router.delete('/:id', deleteItem);

export default router;
`;
}

function itemController() {
  return `/**
 * Controller — HTTP boundary only.
 * Translates req/res into service calls. Zero business logic.
 */
import { ItemService }         from '../services/item.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

const svc = new ItemService();

export const getItems = async (req, res, next) => {
  try { sendSuccess(res, await svc.findAll(req.query)); }
  catch (e) { next(e); }
};

export const getItem = async (req, res, next) => {
  try {
    const item = await svc.findById(req.params.id);
    item ? sendSuccess(res, item) : sendError(res, 'Not found', 404);
  } catch (e) { next(e); }
};

export const createItem = async (req, res, next) => {
  try { sendSuccess(res, await svc.create(req.body), 201); }
  catch (e) { next(e); }
};

export const updateItem = async (req, res, next) => {
  try {
    const item = await svc.update(req.params.id, req.body);
    item ? sendSuccess(res, item) : sendError(res, 'Not found', 404);
  } catch (e) { next(e); }
};

export const deleteItem = async (req, res, next) => {
  try { await svc.remove(req.params.id); res.status(204).end(); }
  catch (e) { next(e); }
};
`;
}

function itemService() {
  return `/**
 * Service — all business logic.
 * No HTTP context.  Swap model without touching controller.
 */
import { Item } from '../models/item.model.js';

export class ItemService {
  findAll(query = {})    { return Item.find(query); }
  findById(id)           { return Item.findById(id); }
  create(data)           { return Item.create(data); }
  update(id, data)       { return Item.findByIdAndUpdate(id, data, { new: true }); }
  remove(id)             { return Item.findByIdAndDelete(id); }
}
`;
}

function errorMiddleware() {
  return `import { logger } from '../utils/logger.js';

// Express requires 4-arg signature for error handlers
// eslint-disable-next-line no-unused-vars
export const errorMiddleware = (err, req, res, next) => {
  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(req.method + ' ' + req.path + ' -> ' + status + ': ' + message);

  res.status(status).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
`;
}

function validateMiddleware() {
  return `/**
 * Joi validation middleware factory.
 * Usage: router.post('/', validate(schema), handler)
 */
export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: error.details.map((d) => d.message),
      },
    });
  }
  req.body = value;
  next();
};
`;
}

function responseUtil() {
  return `export const sendSuccess = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });

export const sendError = (res, message, status = 400) =>
  res.status(status).json({ success: false, error: { message } });
`;
}

function loggerUtil() {
  return `const RESET = '\u001b[0m';
const BLUE  = '\u001b[34m';
const YELLW = '\u001b[33m';
const RED   = '\u001b[31m';

const fmt = (colour, level, args) =>
  '[' + new Date().toISOString() + '] ' + colour + level + RESET + ' ' + args.join(' ');

export const logger = {
  info:  (...a) => console.log(fmt(BLUE,  'INFO ', a)),
  warn:  (...a) => console.warn(fmt(YELLW,'WARN ', a)),
  error: (...a) => console.error(fmt(RED, 'ERROR', a)),
};
`;
}

function readme() {
  return `# <%= projectName %>

> Scaffolded by **crud-scaffold** — Express / <%= db %><% if (includeAuth) { %> + JWT Auth<% } %>

## Stack
| Layer      | Technology             |
|------------|------------------------|
| Runtime    | Node.js 18+            |
| Framework  | Express 4              |
| Database   | <%= db %>              |
| Validation | Joi                    |
| Auth       | <%= includeAuth ? 'jsonwebtoken + bcryptjs' : 'None' %> |

## Quick Start

\`\`\`bash
cp .env.example .env   # edit DATABASE_URL + JWT_SECRET
npm run dev            # hot-reload via nodemon
\`\`\`

## Project Structure

\`\`\`
src/
  config/       App + DB configuration
  controllers/  HTTP boundary — delegates to services
  middleware/   Error handler, Joi validation<% if (includeAuth) { %>, JWT auth<% } %>
  models/       Data layer / ORM schemas
  routes/       Route declarations
  services/     Business logic (no HTTP context)
  utils/        Shared helpers (logger, response)
\`\`\`

## API

| Method | Path               | Description   |
|--------|--------------------|---------------|
| GET    | /api/v1/items      | List all items|
| GET    | /api/v1/items/:id  | Get one item  |
| POST   | /api/v1/items      | Create item   |
| PUT    | /api/v1/items/:id  | Update item   |
| DELETE | /api/v1/items/:id  | Delete item   |
<% if (includeAuth) { %>| POST   | /api/v1/auth/register | Register  |
| POST   | /api/v1/auth/login    | Get JWT   |<% } %>
`;
}
