// @ts-nocheck
import { InMemoryRepository } from '../persistence/in-memory.js';
import { PostgresRepository } from '../persistence/postgres.js';
import type { Repository } from '../persistence/types.js';
import type { Tenant } from '../domain/tenant.js';
import type { Expediente } from '../domain/expediente.js';

let tenantRepo: Repository<Tenant> | null = null;
let expedienteRepo: Repository<Expediente> | null = null;
let initialized = false;

function getConnectionString(): string {
  return process.env.DATABASE_URL ?? '';
}

async function initRepos() {
  if (initialized) return;
  const connStr = getConnectionString();

  if (connStr) {
    console.log('🔌 Conectando a PostgreSQL (Supabase)...');
    const tenantPg = new PostgresRepository<Tenant>(connStr, 'tenants');
    const expPg = new PostgresRepository<Expediente>(connStr, 'expedientes');
    await tenantPg.init();
    await expPg.init();
    tenantRepo = tenantPg;
    expedienteRepo = expPg;
    console.log('✅ Conectado a PostgreSQL correctamente');
  } else {
    console.log('⚠️ No hay DATABASE_URL. Usando memoria (datos se borrarán al reiniciar).');
    tenantRepo = new InMemoryRepository<Tenant>();
    expedienteRepo = new InMemoryRepository<Expediente>();
  }
  initialized = true;
}

export async function getTenantRepoAsync(): Promise<Repository<Tenant>> {
  await initRepos();
  return tenantRepo!;
}

export async function getExpedienteRepoAsync(): Promise<Repository<Expediente>> {
  await initRepos();
  return expedienteRepo!;
}
