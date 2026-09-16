import {
  type Hablante,
  type ValidacionLinguistica,
} from "./types.js";

/**
 * Repositorio en memoria para hablantes y validaciones linguisticas.
 *
 * En el piloto no hay base de datos. La persistencia real llega
 * en la Fase 3 con Firestore o PostgreSQL.
 */
export class LinguisticRepository {
  private readonly hablantes: Map<string, Hablante> = new Map();
  private readonly validaciones: Map<string, ValidacionLinguistica> = new Map();

  guardarHablante(hablante: Hablante): void {
    this.hablantes.set(hablante.id, hablante);
  }

  obtenerHablante(id: string): Hablante | null {
    return this.hablantes.get(id) ?? null;
  }

  listarHablantes(): Hablante[] {
    return Array.from(this.hablantes.values());
  }

  listarHablantesPorTenant(tenantId: string): Hablante[] {
    return this.listarHablantes().filter((h) => h.tenantId === tenantId);
  }

  existeHablante(id: string): boolean {
    return this.hablantes.has(id);
  }

  guardarValidacion(validacion: ValidacionLinguistica): void {
    this.validaciones.set(validacion.id, validacion);
  }

  obtenerValidacion(id: string): ValidacionLinguistica | null {
    return this.validaciones.get(id) ?? null;
  }

  listarValidaciones(): ValidacionLinguistica[] {
    return Array.from(this.validaciones.values());
  }

  listarValidacionesPorExpediente(expedienteId: string): ValidacionLinguistica[] {
    return this.listarValidaciones().filter(
      (v) => v.expedienteId === expedienteId
    );
  }

  existeValidacion(id: string): boolean {
    return this.validaciones.has(id);
  }

  contarHablantes(): number {
    return this.hablantes.size;
  }

  contarValidaciones(): number {
    return this.validaciones.size;
  }

  limpiar(): void {
    this.hablantes.clear();
    this.validaciones.clear();
  }
}
