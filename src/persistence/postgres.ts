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

  // AHORA SÍ LEEMOS LOS DATOS
  async obtener(id: string): Promise<T | null> {
    const res = await this.pool.query(`SELECT data FROM ${this.tableName} WHERE id = $1`, [id]);
    if (res.rows.length === 0) return null;
    return res.rows[0].data as T;
  }

  async listar(): Promise<T[]> {
    const res = await this.pool.query(`SELECT data FROM ${this.tableName}`);
    return res.rows.map((row: any) => row.data as T);
  }

  async existe(id: string): Promise<boolean> {
    const res = await this.pool.query(`SELECT 1 FROM ${this.tableName} WHERE id = $1`, [id]);
    return res.rows.length > 0;
  }

  async contar(): Promise<number> {
    const res = await this.pool.query(`SELECT COUNT(*) FROM ${this.tableName}`);
    return parseInt(res.rows[0].count, 10);
  }

  eliminar(id: string): void {
    this.pool.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
  }

  limpiar(): void {
    this.pool.query(`DELETE FROM ${this.tableName}`);
  }
}
