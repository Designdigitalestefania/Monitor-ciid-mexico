import pg from 'pg';
import type { Repository } from './types.js';

const { Pool } = pg;

export class PostgresRepository<T extends { id: string }> implements Repository<T> {
  private pool: any;
  private tableName: string;

  constructor(connectionString: string, tableName: string) {
    this.tableName = tableName;
    this.pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
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
    this.pool.query(
      `INSERT INTO ${this.tableName} (id, data) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
      [item.id, JSON.stringify(item)]
    ).catch((err: any) => console.error('Error guardando:', err));
  }

  // Usamos _id para que TypeScript sepa que no lo usamos
  obtener(_id: string): T | null { return null; }
  listar(): T[] { return []; }
  existe(_id: string): boolean { return false; }
  contar(): number { return 0; }
  eliminar(_id: string): boolean { return false; }
  limpiar(): void {}
}
