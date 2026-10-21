import { InMemoryRepository } from '../persistence/in-memory.js';
import { SqliteRepository } from '../persistence/sqlite.js';
import type { Repository } from '../persistence/types.js';
import type { Tenant } from '../domain/tenant.js';
import type { Expediente } from '../domain/expediente.js';
import { config } from './config.js';

let tenantRepo: Repository<Tenant> | null = null;
let expedienteRepo: Repository<Expediente> | null = null;

export function getTenantRepo(): Repository<Tenant> {
  if (!tenantRepo) {
    tenantRepo = config.env === 'production'
      ? new SqliteRepository<Tenant>(config.dbPath, 'tenants')
      : new InMemoryRepository<Tenant>();
  }
  return tenantRepo;
}

export function getExpedienteRepo(): Repository<Expediente> {
  if (!expedienteRepo) {
    expedienteRepo = config.env === 'production'
      ? new SqliteRepository<Expediente>(config.dbPath, 'expedientes')
      : new InMemoryRepository<Expediente>();
  }
  return expedienteRepo;
}

export function resetRepos(): void {
  tenantRepo = null;
  expedienteRepo = null;
}
