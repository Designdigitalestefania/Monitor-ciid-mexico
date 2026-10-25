import pg from 'pg';
import type { Repository } from './types.js';

const { Pool } = pg;

/**
 * Implementación de Repository usando PostgreSQL (Supabase).
 * Crea tablas automáticamente si no existen.
 */
export class PostgresRepository<T extends { id: string }> implements Repository<T> {
  private pool: pg.Pool;
  private tableName: string;

  constructor(connectionString: string, tableName: string) {
    this.tableName = tableName;
    this.pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false } // Requerido por Supabase
    });
  }

  async init(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);
  }

  guardar(item: T): void {
    // Ejecución en background para no bloquear el flujo sincrónico actual
    this.pool.query(
      `INSERT INTO ${this.tableName} (id, data) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
      [item.id, JSON.stringify(item)]
    ).catch(err => console.error('Error guardando en PostgreSQL:', err));
  }

  obtener(id: string): T | null {
    throw new Error('Método obtener() sincrónico no soportado en PostgreSQL. Usar async.');
  }

  listar(): T[] {
    throw new Error('Método listar() sincrónico no soportado en PostgreSQL. Usar async.');
  }

  existe(id: string): boolean {
    throw new Error('Método existe() sincrónico no soportado en PostgreSQL. Usar async.');
  }

  contar(): number {
    throw new Error('Método contar() sincrónico no soportado en PostgreSQL. Usar async.');
  }

  eliminar(id: string): boolean {
    this.pool.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id])
      .catch(err => console.error('Error eliminando en PostgreSQL:', err));
    return true;
  }

  limpiar(): void {
    this.pool.query(`DELETE FROM ${this.tableName}`)
      .catch(err => console.error('Error limpiando PostgreSQL:', err));
  }
}
