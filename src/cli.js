#!/usr/bin/env node
/**
 * CLI INTERFACE LAYER  (src/cli.js)
 * ──────────────────────────────────────────────────────────────────────────────
 * Single responsibility: collect user intent (flags OR interactive prompts)
 * and hand a validated config object to the three lower layers.
 *
 * This file knows nothing about templates, files, or installers.
 * ──────────────────────────────────────────────────────────────────────────────
 */
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { createLogger } from './layers/logger.js';
import { resolveTemplate } from './layers/resolver.js';
import { generateProject } from './layers/generator.js';
import { installDependencies } from './layers/installer.js';
import { SUPPORTED_LANGUAGES, SUPPORTED_DBS } from './templates/registry.js';

const log = createLogger('CLI');
const program = new Command();

// ── Flag definitions ──────────────────────────────────────────────────────────
program
  .name('crud-scaffold')
  .description('Scaffold production-grade CRUD applications')
  .version('1.0.0')
  .option('-n, --name <name>', 'Project name')
  .option('-l, --lang <lang>', `Language: ${Object.keys(SUPPORTED_LANGUAGES).join(' | ')}`)
  .option('-v, --variant <variant>', 'Framework variant (express | fastify | gin | ...)')
  .option('-d, --db <db>', `Database: ${SUPPORTED_DBS.join(' | ')}`)
  .option('--auth', 'Include JWT authentication module', false)
  .option('--docker', 'Include Docker + docker-compose', false)
  .option('--test', 'Include test scaffolding', false)
  .option('--no-install', 'Skip dependency installation')
  .parse(process.argv);

const cliFlags = program.opts();

// ── Prompt for anything missing from flags ────────────────────────────────────
async function collectConfig(flags) {
  const cfg = { ...flags };

  // Language — validate against registry
  if (!cfg.lang || !SUPPORTED_LANGUAGES[cfg.lang]) {
    const { lang } = await inquirer.prompt([
      {
        type: 'list',
        name: 'lang',
        message: 'Target language:',
        choices: Object.entries(SUPPORTED_LANGUAGES).map(([key, m]) => ({
          name: `${m.label}  (${m.variants.join(', ')})`,
          value: key,
        })),
      },
    ]);
    cfg.lang = lang;
  }

  const langMeta = SUPPORTED_LANGUAGES[cfg.lang];

  // Framework variant
  if (!cfg.variant || !langMeta.variants.includes(cfg.variant)) {
    if (langMeta.variants.length === 1) {
      [cfg.variant] = langMeta.variants;
    } else {
      const { variant } = await inquirer.prompt([
        {
          type: 'list',
          name: 'variant',
          message: `${langMeta.label} framework:`,
          choices: langMeta.variants,
          default: langMeta.defaultVariant,
        },
      ]);
      cfg.variant = variant;
    }
  }

  // Project name
  if (!cfg.name) {
    const { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Project name:',
        default: `my-${cfg.variant}-app`,
        validate: (v) => /^[a-zA-Z0-9_-]+$/.test(v) || 'Alphanumeric, dash and underscore only',
      },
    ]);
    cfg.name = name;
  }

  // Database
  if (!cfg.db || !SUPPORTED_DBS.includes(cfg.db)) {
    const { db } = await inquirer.prompt([
      {
        type: 'list',
        name: 'db',
        message: 'Database:',
        choices: SUPPORTED_DBS,
        default: langMeta.defaultDb,
      },
    ]);
    cfg.db = db;
  }

  // Optional features — only prompt interactively (flags override silently)
  const hasFeatureFlags = ['--auth', '--docker', '--test', '--no-install'].some((f) =>
    process.argv.includes(f)
  );

  if (!hasFeatureFlags) {
    const { features } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'features',
        message: 'Optional features:',
        choices: [
          { name: 'JWT Authentication', value: 'auth' },
          { name: 'Docker setup', value: 'docker' },
          { name: 'Test scaffolding', value: 'test' },
        ],
      },
    ]);
    cfg.auth = features.includes('auth');
    cfg.docker = features.includes('docker');
    cfg.test = features.includes('test');
  }

  return cfg;
}

// ── Banner ────────────────────────────────────────────────────────────────────
function printBanner() {
  console.log(chalk.bold.cyan('CRUD Scaffold'));
}

// ── Post-install instructions ─────────────────────────────────────────────────
function printNextSteps(cfg) {
  const cmds = {
    nodejs: ['cp .env.example .env', 'npm run dev'],
    python: [
      'python -m venv venv && source venv/bin/activate',
      'cp .env.example .env',
      'pip install -r requirements.txt',
      'uvicorn app.main:app --reload',
    ],
    go: ['cp .env.example .env', 'go run cmd/server/main.go'],
  };

  console.log(chalk.bold.green('\n  ✔  Project scaffolded successfully!\n'));
  console.log(chalk.bold('  Next steps:\n'));
  console.log(chalk.cyan(`    cd ${cfg.name}`));
  (cmds[cfg.lang] || []).forEach((c) => console.log(chalk.cyan(`    ${c}`)));
  if (cfg.docker) console.log(chalk.cyan('    # or: docker-compose up --build'));
  console.log('');
}

// ── Main pipeline ─────────────────────────────────────────────────────────────
async function main() {
  printBanner();
  try {
    const config = await collectConfig(cliFlags);

    log.step(`Scaffolding ${config.lang}/${config.variant}  →  ./${config.name}`);
    log.info(
      `DB: ${config.db}  |  Auth: ${config.auth}  |  Docker: ${config.docker}  |  Tests: ${config.test}`
    );

    // Layer 1 — Resolve the correct template adapter from the registry
    const template = await resolveTemplate(config);

    // Layer 2 — Write all files to disk using EJS interpolation
    await generateProject(template, config);

    // Layer 3 — Run language-appropriate dependency installer
    if (config.install !== false) {
      await installDependencies(config);
    }

    printNextSteps(config);
  } catch (err) {
    log.error(err.message);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
  }
}

main();
