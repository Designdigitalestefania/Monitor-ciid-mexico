import { type Tenant } from "../../domain/tenant.js";

/**
 * Repositorio en memoria para tenants.
 *
 * En el piloto no hay base de datos. La persistencia real llega
 * en la Fase 3 con Firestore o PostgreSQL.
 */
export class TenantRepository {
  private readonly store: Map<string, Tenant> = new Map();

  guardar(tenant: Tenant): void {
    this.store.set(tenant.id, tenant);
  }

  obtener(id: string): Tenant | null {
    return this.store.get(id) ?? null;
  }

  listar(): Tenant[] {
    return Array.from(this.store.values());
  }

  existe(id: string): boolean {
    return this.store.has(id);
  }

  contar(): number {
    return this.store.size;
  }

  limpiar(): void {
    this.store.clear();
  }
}
