import { createRequire } from "node:module";
import { type RepositoryConFiltro } from "./types.js";

/**
 * Implementacion SQLite de la interfaz Repository.
 *
 * Persiste en un archivo .db local usando node:sqlite (nativo en
 * Node 22+). No requiere dependencias externas.
 *
 * Cargamos node:sqlite via createRequire para evitar que bundlers
 * (Vite, Vitest, esbuild) intenten resolverlo como paquete npm.
 *
 * Ver docs/decisions/004-multi-tenant.md.
 */

const require = createRequire(import.meta.url);
const sqliteModule = require("node:sqlite") as {
  DatabaseSync: new (ruta: string) => DatabaseInstance;
};

interface DatabaseInstance {
  prepare(sql: string): {
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    run(...params: unknown[]): { changes: number };
  };
  exec(sql: string): void;
  close(): void;
}

export type { DatabaseInstance as DatabaseSync };

export class SqliteRepository<T extends { id: string }>
  implements RepositoryConFiltro<T>
{
  private readonly db: DatabaseInstance;
  private readonly tabla: string;

  constructor(db: DatabaseInstance, tabla: string) {
    this.db = db;
    this.tabla = tabla;
  }

  guardar(item: T): void {
    const ahora = new Date().toISOString();
    const data = JSON.stringify(item);

    const existente = this.db
      .prepare(`SELECT id FROM ${this.tabla} WHERE id = ?`)
      .get(item.id);

    if (existente) {
      this.db
        .prepare(
          `UPDATE ${this.tabla} SET data = ?, actualizado_en = ? WHERE id = ?`
        )
        .run(data, ahora, item.id);
    } else {
      this.db
        .prepare(
          `INSERT INTO ${this.tabla} (id, data, creado_en, actualizado_en)
           VALUES (?, ?, ?, ?)`
        )
        .run(item.id, data, ahora, ahora);
    }
  }

  obtener(id: string): T | null {
    const row = this.db
      .prepare(`SELECT data FROM ${this.tabla} WHERE id = ?`)
      .get(id) as { data: string } | undefined;

    if (!row) return null;
    return JSON.parse(row.data) as T;
  }

  listar(): T[] {
    const rows = this.db
      .prepare(`SELECT data FROM ${this.tabla}`)
      .all() as Array<{ data: string }>;

    return rows.map((row) => JSON.parse(row.data) as T);
  }

  existe(id: string): boolean {
    const row = this.db
      .prepare(`SELECT 1 FROM ${this.tabla} WHERE id = ?`)
      .get(id);
    return row !== undefined;
  }

  contar(): number {
    const row = this.db
      .prepare(`SELECT COUNT(*) as total FROM ${this.tabla}`)
      .get() as { total: number };
    return row.total;
  }

  eliminar(id: string): boolean {
    const result = this.db
      .prepare(`DELETE FROM ${this.tabla} WHERE id = ?`)
      .run(id);
    return result.changes > 0;
  }

  limpiar(): void {
    this.db.prepare(`DELETE FROM ${this.tabla}`).run();
  }

  filtrar(predicado: (item: T) => boolean): T[] {
    return this.listar().filter(predicado);
  }
}

/**
 * Crea una base de datos SQLite en memoria o en disco.
 */
export function crearBaseDatos(ruta: string = ":memory:"): DatabaseInstance {
  return new sqliteModule.DatabaseSync(ruta);
}

/**
 * Aplica el esquema SQL a la base de datos.
 */
export function aplicarEsquema(db: DatabaseInstance, esquemaSQL: string): void {
  db.exec(esquemaSQL);
}
