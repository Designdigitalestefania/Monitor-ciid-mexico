/**
 * Interfaz generica de repositorio.
 *
 * Toda persistencia (memoria, SQLite, PostgreSQL) implementa este
 * contrato. Los modulos consumen la interfaz, no la implementacion.
 *
 * Ver docs/decisions/004-multi-tenant.md.
 */

export interface Repository<T extends { id: string }> {
  guardar(item: T): void;
  obtener(id: string): T | null;
  listar(): T[];
  existe(id: string): boolean;
  contar(): number;
  eliminar(id: string): boolean;
  limpiar(): void;
}

export interface RepositoryConFiltro<T extends { id: string }> extends Repository<T> {
  filtrar(predicado: (item: T) => boolean): T[];
}
