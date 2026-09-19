import { type Distribucion } from "./types.js";

/**
 * Repositorio en memoria para distribuciones.
 *
 * En el piloto no hay base de datos. La persistencia real llega
 * en la Fase 3 con Firestore o PostgreSQL.
 */
export class DistributionRepository {
  private readonly store: Map<string, Distribucion> = new Map();

  guardar(distribucion: Distribucion): void {
    this.store.set(distribucion.id, distribucion);
  }

  obtener(id: string): Distribucion | null {
    return this.store.get(id) ?? null;
  }

  listar(): Distribucion[] {
    return Array.from(this.store.values());
  }

  listarPorExpediente(expedienteId: string): Distribucion[] {
    return this.listar().filter((d) => d.expedienteId === expedienteId);
  }

  listarPorTenant(tenantId: string): Distribucion[] {
    return this.listar().filter((d) => d.tenantId === tenantId);
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
