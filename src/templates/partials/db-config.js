/**
 * DATABASE CONFIG PARTIAL  (src/templates/partials/db-config.js)
 * ──────────────────────────────────────────────────────────────────────────────
 * Central registry of DB-specific artefacts for Node.js adapters:
 *   packageName    → npm package name
 *   packageVersion → semver range
 *   configFile     → generated  src/config/database.js  content
 *   modelFile      → generated  src/models/item.model.js  content
 *
 * Adding a new DB: add one entry per language below.
 * ──────────────────────────────────────────────────────────────────────────────
 */

const CONFIGS = {
  nodejs: {
    mongodb: {
      packageName: 'mongoose',
      packageVersion: '^8.0.3',

      configFile: `import mongoose    from 'mongoose';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

export const connectDb = async () => {
  await mongoose.connect(config.dbUri);
  logger.info('MongoDB connected via Mongoose');
};
`,
      modelFile: `import mongoose from 'mongoose';
import Joi      from 'joi';

const schema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Item = mongoose.model('Item', schema);

// Joi schema consumed by validate middleware
export const itemSchema = Joi.object({
  name:        Joi.string().min(1).required(),
  description: Joi.string().allow(''),
});
`,
    },

    postgresql: {
      packageName: 'pg',
      packageVersion: '^8.11.3',

      configFile: `import pg          from 'pg';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

export const pool = new pg.Pool({ connectionString: config.dbUri });

export const connectDb = async () => {
  await pool.query('SELECT 1');
  logger.info('PostgreSQL connected');
};
`,
      modelFile: `import { pool } from '../config/database.js';
import Joi        from 'joi';

export const Item = {
  find:              ()        => pool.query('SELECT * FROM items ORDER BY created_at DESC').then(r => r.rows),
  findById:          (id)      => pool.query('SELECT * FROM items WHERE id=$1', [id]).then(r => r.rows[0] || null),
  create:            (d)       => pool.query('INSERT INTO items(name,description) VALUES($1,$2) RETURNING *', [d.name, d.description]).then(r => r.rows[0]),
  findByIdAndUpdate: (id, d)   => pool.query('UPDATE items SET name=$1, description=$2 WHERE id=$3 RETURNING *', [d.name, d.description, id]).then(r => r.rows[0] || null),
  findByIdAndDelete: (id)      => pool.query('DELETE FROM items WHERE id=$1', [id]),
};

export const itemSchema = Joi.object({
  name:        Joi.string().min(1).required(),
  description: Joi.string().allow(''),
});
`,
    },

    sqlite: {
      packageName: 'better-sqlite3',
      packageVersion: '^9.2.2',

      configFile: `import Database    from 'better-sqlite3';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

export const db = new Database(config.dbUri || 'app.db');

// Ensure table exists on startup
db.exec(
  'CREATE TABLE IF NOT EXISTS items (' +
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
  '  name TEXT NOT NULL,' +
  '  description TEXT DEFAULT "",' +
  '  created_at DATETIME DEFAULT CURRENT_TIMESTAMP' +
  ')'
);

// better-sqlite3 is synchronous — wrap for interface parity
export const connectDb = async () => { logger.info('SQLite connected'); };
`,
      modelFile: `import { db } from '../config/database.js';
import Joi      from 'joi';

export const Item = {
  find:              ()      => db.prepare('SELECT * FROM items ORDER BY created_at DESC').all(),
  findById:          (id)    => db.prepare('SELECT * FROM items WHERE id=?').get(id) || null,
  create:            (d)     => {
    const r = db.prepare('INSERT INTO items(name,description) VALUES(?,?)').run(d.name, d.description || '');
    return db.prepare('SELECT * FROM items WHERE id=?').get(r.lastInsertRowid);
  },
  findByIdAndUpdate: (id, d) => {
    db.prepare('UPDATE items SET name=?, description=? WHERE id=?').run(d.name, d.description || '', id);
    return db.prepare('SELECT * FROM items WHERE id=?').get(id) || null;
  },
  findByIdAndDelete: (id)    => db.prepare('DELETE FROM items WHERE id=?').run(id),
};

export const itemSchema = Joi.object({
  name:        Joi.string().min(1).required(),
  description: Joi.string().allow(''),
});
`,
    },
  },
};

/**
 * @param {'nodejs'|'python'|'go'} lang
 * @param {'mongodb'|'postgresql'|'sqlite'} db
 * @returns {{ packageName, packageVersion, configFile, modelFile }}
 */
export function dbConfig(lang, db) {
  const langMap = CONFIGS[lang];
  if (!langMap) throw new Error(`db-config: unknown lang "${lang}"`);
  const cfg = langMap[db];
  if (!cfg) throw new Error(`db-config: no config for ${lang}/${db}`);
  return cfg;
}
