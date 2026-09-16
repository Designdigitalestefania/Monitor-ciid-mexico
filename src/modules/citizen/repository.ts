import { type RegistroCiudadano } from "./types.js";

/**
 * Repositorio en memoria para reportes ciudadanos.
 *
 * En el piloto no hay base de datos. La persistencia real llega
 * en la Fase 3 con Firestore o PostgreSQL.
 */
export class CitizenRepository {
  private readonly store: Map<string, RegistroCiudadano> = new Map();

  guardar(registro: RegistroCiudadano): void {
    this.store.set(registro.id, registro);
  }

  obtener(id: string): RegistroCiudadano | null {
    return this.store.get(id) ?? null;
  }

  listar(): RegistroCiudadano[] {
    return Array.from(this.store.values());
  }

  listarPorTenant(tenantId: string): RegistroCiudadano[] {
    return this.listar().filter((r) => r.tenantId === tenantId);
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
