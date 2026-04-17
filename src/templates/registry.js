/**
 * TEMPLATE REGISTRY  (src/templates/registry.js)
 * ──────────────────────────────────────────────────────────────────────────────
 * THE single file to edit when adding a new language or variant.
 *
 * SUPPORTED_LANGUAGES  → drives CLI prompts + validation
 * TEMPLATE_ADAPTERS    → drives resolver lookup
 *
 * Adding a new language (e.g. Rust/Axum):
 *   1. Create  src/templates/rust/axum.js  exporting  axumAdapter(config)
 *   2. Add entry to SUPPORTED_LANGUAGES below
 *   3. Add entry to TEMPLATE_ADAPTERS below
 *   ── Done.  Zero changes to cli.js, resolver, generator, or installer. ──
 * ──────────────────────────────────────────────────────────────────────────────
 */
import { expressAdapter } from './nodejs/express.js';
import { fastifyAdapter } from './nodejs/fastify.js';
import { fastapiAdapter } from './python/fastapi.js';
import { ginAdapter } from './go/gin.js';

export const SUPPORTED_LANGUAGES = {
  nodejs: {
    label: 'Node.js',
    variants: ['express', 'fastify'],
    defaultVariant: 'express',
    defaultDb: 'mongodb',
  },
  python: {
    label: 'Python',
    variants: ['fastapi'],
    defaultVariant: 'fastapi',
    defaultDb: 'postgresql',
  },
  go: {
    label: 'Go',
    variants: ['gin'],
    defaultVariant: 'gin',
    defaultDb: 'postgresql',
  },
};

export const SUPPORTED_DBS = ['mongodb', 'postgresql', 'sqlite'];

/**
 * Shape: { [lang]: { [variant]: async (config) => manifest } }
 * Each adapter is a pure function — no side-effects, no I/O.
 */
export const TEMPLATE_ADAPTERS = {
  nodejs: { express: expressAdapter, fastify: fastifyAdapter },
  python: { fastapi: fastapiAdapter },
  go: { gin: ginAdapter },
};
