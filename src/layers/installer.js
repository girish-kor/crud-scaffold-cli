/**
 * DEPENDENCY INSTALLER LAYER  (src/layers/installer.js)
 * ──────────────────────────────────────────────────────────────────────────────
 * Single responsibility: run language-appropriate install commands.
 *
 * Intentionally has no knowledge of template content.
 * New languages → add one entry to INSTALL_MAP.
 * ──────────────────────────────────────────────────────────────────────────────
 */
import { execSync } from 'child_process';
import path from 'path';
import { createLogger } from './logger.js';

const log = createLogger('Installer');

// Registry: lang → install command (runs inside the new project directory)
const INSTALL_MAP = {
  nodejs: 'npm install',
  python: 'pip install -r requirements.txt',
  go: 'go mod tidy',
};

export async function installDependencies(config) {
  const projectDir = path.resolve(process.cwd(), config.name);
  const cmd = INSTALL_MAP[config.lang];

  if (!cmd) {
    log.warn(`No installer registered for lang "${config.lang}" — skipping.`);
    return;
  }

  log.info(`Running: ${cmd}`);
  try {
    execSync(cmd, { cwd: projectDir, stdio: 'inherit' });
    log.info('Install complete');
  } catch (err) {
    log.warn(`Install failed (${err.message}).`);
    log.warn('Run the install command manually inside your project directory.');
  }
}
