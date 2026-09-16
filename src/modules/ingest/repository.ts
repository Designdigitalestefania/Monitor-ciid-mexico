import { type Expediente } from "../../domain/expediente.js";

/**
 * Repositorio en memoria para expedientes.
 *
 * En el piloto no hay base de datos. La persistencia real llega
 * en la Fase 3 con Firestore o PostgreSQL.
 */
export class IngestRepository {
  private readonly store: Map<string, Expediente> = new Map();

  guardar(expediente: Expediente): void {
    this.store.set(expediente.id, expediente);
  }

  obtener(id: string): Expediente | null {
    return this.store.get(id) ?? null;
  }

  listar(): Expediente[] {
    return Array.from(this.store.values());
  }

  listarPorTenant(tenantId: string): Expediente[] {
    return this.listar().filter((e) => e.tenantId === tenantId);
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
