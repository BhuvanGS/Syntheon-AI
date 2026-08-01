/**
 * Database access barrel. Domain modules live under lib/db/*;
 * this file re-exports so existing `@/lib/db` imports keep working.
 */
export * from './db/types';
export * from './db/meetings';
export * from './db/tickets';
export * from './db/projects';
export * from './db/rest';
