/**
 * LOGGER UTILITY  (src/layers/logger.js)
 * Thin, namespaced console wrapper. Zero external dependencies.
 */
import chalk from 'chalk';

export function createLogger(ns) {
  const tag = chalk.gray(`[${ns}]`);
  return {
    step: (...a) => console.log(chalk.magenta('▶'), tag, chalk.bold(...a)),
    info: (...a) => console.log(chalk.blue('ℹ'), tag, ...a),
    ok: (...a) => console.log(chalk.green('✔'), tag, ...a),
    warn: (...a) => console.warn(chalk.yellow('⚠'), tag, ...a),
    error: (...a) => console.error(chalk.red('✖'), tag, ...a),
  };
}
