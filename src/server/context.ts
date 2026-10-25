import { InMemoryRepository } from '../persistence/in-memory.js';
import type { Repository } from '../persistence/types.js';
import type { Tenant } from '../domain/tenant.js';
import type { Expediente } from '../domain/expediente.js';

let tenantRepo: Repository<Tenant> | null = null;
let expedienteRepo: Repository<Expediente> | null = null;

export function getTenantRepo(): Repository<Tenant> {
  if (!tenantRepo) tenantRepo = new InMemoryRepository<Tenant>();
  return tenantRepo;
}

export function getExpedienteRepo(): Repository<Expediente> {
  if (!expedienteRepo) expedienteRepo = new InMemoryRepository<Expediente>();
  return expedienteRepo;
}
