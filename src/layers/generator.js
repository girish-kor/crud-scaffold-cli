/**
 * FILE GENERATION ENGINE  (src/layers/generator.js)
 * ──────────────────────────────────────────────────────────────────────────────
 * Single responsibility: consume a manifest and write files to disk.
 *
 * - Applies EJS variable interpolation to every string value in manifest.files
 * - Serialises plain objects as JSON
 * - Knows nothing about languages, frameworks, or CLI input
 * ──────────────────────────────────────────────────────────────────────────────
 */
import path from 'path';
import fs from 'fs-extra';
import ejs from 'ejs';
import { createLogger } from './logger.js';

const log = createLogger('Generator');

/**
 * @param {object} manifest  Template manifest from the resolver
 * @param {object} config    Raw CLI config (becomes EJS template variables)
 */
export async function generateProject(manifest, config) {
  const outputDir = path.resolve(process.cwd(), config.name);

  if (await fs.pathExists(outputDir)) {
    throw new Error(
      `Directory "${config.name}" already exists. Remove it or choose a different name.`
    );
  }

  await fs.mkdirp(outputDir);
  log.info(`Created: ${outputDir}`);

  const vars = _buildVars(config, manifest);
  const entries = Object.entries(manifest.files);

  for (const [relPath, content] of entries) {
    const absPath = path.join(outputDir, relPath);
    // eslint-disable-next-line no-await-in-loop
    await fs.mkdirp(path.dirname(absPath));

    let rendered;
    if (typeof content === 'string') {
      rendered = ejs.render(content, vars);
    } else {
      rendered = JSON.stringify(content, null, 2);
    }

    // eslint-disable-next-line no-await-in-loop
    await fs.writeFile(absPath, rendered, 'utf8');
    log.info(`  +${relPath}`);
  }

  log.info(`${entries.length} files written to ${config.name}/`);
}

// All EJS template vars come from here — single source of truth
function _buildVars(config, manifest) {
  return {
    projectName: config.name,
    lang: config.lang,
    variant: config.variant,
    db: config.db,
    includeAuth: !!config.auth,
    includeDocker: !!config.docker,
    includeTests: !!config.test,
    port: manifest.defaultPort || 3000,
    // Adapter-specific extras (optional)
    ...(manifest.vars || {}),
  };
}
