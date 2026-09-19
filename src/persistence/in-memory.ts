import { type RepositoryConFiltro } from "./types.js";

/**
 * Implementacion en memoria de la interfaz Repository.
 *
 * Se usa para tests rapidos y para desarrollo sin base de datos.
 * No persiste entre ejecuciones.
 */
export class InMemoryRepository<T extends { id: string }>
  implements RepositoryConFiltro<T>
{
  private readonly store: Map<string, T> = new Map();

  guardar(item: T): void {
    this.store.set(item.id, item);
  }

  obtener(id: string): T | null {
    return this.store.get(id) ?? null;
  }

  listar(): T[] {
    return Array.from(this.store.values());
  }

  existe(id: string): boolean {
    return this.store.has(id);
  }

  contar(): number {
    return this.store.size;
  }

  eliminar(id: string): boolean {
    return this.store.delete(id);
  }

  limpiar(): void {
    this.store.clear();
  }

  filtrar(predicado: (item: T) => boolean): T[] {
    return this.listar().filter(predicado);
  }
}
