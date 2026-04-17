/**
 * TEMPLATE RESOLUTION LAYER  (src/layers/resolver.js)
 * ──────────────────────────────────────────────────────────────────────────────
 * Single responsibility: map (lang, variant) → adapter → manifest.
 *
 * This layer is fully registry-driven.  New languages never require changes
 * here — only a new adapter file and a registry entry.
 * ──────────────────────────────────────────────────────────────────────────────
 */
import { TEMPLATE_ADAPTERS } from '../templates/registry.js';
import { createLogger } from './logger.js';

const log = createLogger('Resolver');

/**
 * @param  {object} config  Validated CLI configuration
 * @returns {Promise<object>} Template manifest: { files, installCommand, defaultPort, vars }
 */
export async function resolveTemplate(config) {
  const { lang, variant } = config;

  const langAdapters = TEMPLATE_ADAPTERS[lang];
  if (!langAdapters) {
    throw new Error(
      `No adapters registered for language "${lang}". ` +
        `Add one to templates/registry.js and create templates/${lang}/${variant}.js`
    );
  }

  const adapter = langAdapters[variant];
  if (!adapter) {
    throw new Error(
      `No adapter for variant "${variant}" under language "${lang}". ` +
        `Available variants: ${Object.keys(langAdapters).join(', ')}`
    );
  }

  log.info(`Resolved adapter: ${lang}/${variant}`);

  // Adapters are pure async functions → no side effects in resolver
  const manifest = await adapter(config);

  _validateManifest(manifest, lang, variant);
  log.info(`Manifest OK — ${Object.keys(manifest.files).length} files scheduled`);

  return manifest;
}

function _validateManifest(manifest, lang, variant) {
  const required = ['files', 'installCommand'];
  for (const field of required) {
    if (manifest[field] == null) {
      throw new Error(`Adapter ${lang}/${variant} manifest is missing required field: "${field}"`);
    }
  }
}
