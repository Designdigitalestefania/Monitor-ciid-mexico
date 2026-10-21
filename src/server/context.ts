import { createRequire } from 'node:module';
import { InMemoryRepository } from '../persistence/in-memory.js';
import { SqliteRepository } from '../persistence/sqlite.js';
import type { Repository } from '../persistence/types.js';
import type { Tenant } from '../domain/tenant.js';
import type { Expediente } from '../domain/expediente.js';
import { config } from './config.js';

const require = createRequire(import.meta.url);

let tenantRepo: Repository<Tenant> | null = null;
let expedienteRepo: Repository<Expediente> | null = null;
let sqliteDb: any = null;

function getSqliteDb() {
  if (!sqliteDb) {
    const { DatabaseSync } = require('node:sqlite');
    sqliteDb = new DatabaseSync(config.dbPath);
    // Crear tablas si no existen
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS expedientes (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
    `);
    console.log(`✅ SQLite conectado en ${config.dbPath}`);
  }
  return sqliteDb;
}

export function getTenantRepo(): Repository<Tenant> {
  if (!tenantRepo) {
    if (config.env === 'production') {
      tenantRepo = new SqliteRepository<Tenant>(getSqliteDb(), 'tenants');
    } else {
      tenantRepo = new InMemoryRepository<Tenant>();
    }
  }
  return tenantRepo;
}

export function getExpedienteRepo(): Repository<Expediente> {
  if (!expedienteRepo) {
    if (config.env === 'production') {
      expedienteRepo = new SqliteRepository<Expediente>(getSqliteDb(), 'expedientes');
    } else {
      expedienteRepo = new InMemoryRepository<Expediente>();
    }
  }
  return expedienteRepo;
}

export function resetRepos(): void {
  tenantRepo = null;
  expedienteRepo = null;
}
