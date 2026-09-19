import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  SqliteRepository,
  crearBaseDatos,
  aplicarEsquema,
} from "../../../src/persistence/sqlite.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const schemaPath = resolve(__dirname, "../../../src/persistence/schema.sql");
const schema = readFileSync(schemaPath, "utf-8");

interface ItemDemo {
  readonly id: string;
  readonly valor: number;
  readonly categoria: string;
}

describe("SqliteRepository", () => {
  let db: ReturnType<typeof crearBaseDatos>;
  let repo: SqliteRepository<ItemDemo>;

  beforeEach(() => {
    db = crearBaseDatos(":memory:");
    db.exec("CREATE TABLE IF NOT EXISTS tenants (id TEXT PRIMARY KEY, data TEXT, creado_en TEXT, actualizado_en TEXT)");
    db.exec("CREATE TABLE IF NOT EXISTS expedientes (id TEXT PRIMARY KEY, data TEXT, creado_en TEXT, actualizado_en TEXT)");
    repo = new SqliteRepository<ItemDemo>(db, "tenants");
  });

  afterEach(() => {
    db.close();
  });

  it("guarda y obtiene un item", () => {
    repo.guardar({ id: "a", valor: 1, categoria: "x" });
    const item = repo.obtener("a");
    expect(item).not.toBeNull();
    expect(item?.valor).toBe(1);
    expect(item?.categoria).toBe("x");
  });

  it("devuelve null si el item no existe", () => {
    expect(repo.obtener("no-existe")).toBeNull();
  });

  it("guarda multiples items", () => {
    repo.guardar({ id: "a", valor: 1, categoria: "x" });
    repo.guardar({ id: "b", valor: 2, categoria: "y" });
    repo.guardar({ id: "c", valor: 3, categoria: "x" });
    expect(repo.contar()).toBe(3);
    expect(repo.listar().length).toBe(3);
  });

  it("sobrescribe si el id ya existe", () => {
    repo.guardar({ id: "a", valor: 1, categoria: "x" });
    repo.guardar({ id: "a", valor: 99, categoria: "z" });
    expect(repo.contar()).toBe(1);
    expect(repo.obtener("a")?.valor).toBe(99);
  });

  it("verifica existencia", () => {
    repo.guardar({ id: "a", valor: 1, categoria: "x" });
    expect(repo.existe("a")).toBe(true);
    expect(repo.existe("b")).toBe(false);
  });

  it("elimina un item", () => {
    repo.guardar({ id: "a", valor: 1, categoria: "x" });
    const eliminado = repo.eliminar("a");
    expect(eliminado).toBe(true);
    expect(repo.existe("a")).toBe(false);
  });

  it("devuelve false al eliminar item inexistente", () => {
    expect(repo.eliminar("no-existe")).toBe(false);
  });

  it("limpia todos los items", () => {
    repo.guardar({ id: "a", valor: 1, categoria: "x" });
    repo.guardar({ id: "b", valor: 2, categoria: "y" });
    repo.limpiar();
    expect(repo.contar()).toBe(0);
  });

  it("filtra por predicado", () => {
    repo.guardar({ id: "a", valor: 1, categoria: "x" });
    repo.guardar({ id: "b", valor: 2, categoria: "y" });
    repo.guardar({ id: "c", valor: 3, categoria: "x" });

    const filtrados = repo.filtrar((item) => item.categoria === "x");
    expect(filtrados.length).toBe(2);
  });

  it("persiste entre instancias de repositorio sobre la misma db", () => {
    repo.guardar({ id: "a", valor: 1, categoria: "x" });
    const otroRepo = new SqliteRepository<ItemDemo>(db, "tenants");
    expect(otroRepo.obtener("a")?.valor).toBe(1);
  });

  it("esquema SQL completo se aplica sin errores", () => {
    const db2 = crearBaseDatos(":memory:");
    expect(() => aplicarEsquema(db2, schema)).not.toThrow();

    const tablas = db2
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as Array<{ name: string }>;
    const nombres = tablas.map((t) => t.name);

    expect(nombres).toContain("tenants");
    expect(nombres).toContain("expedientes");
    expect(nombres).toContain("reportes_ciudadanos");
    expect(nombres).toContain("hablantes");
    expect(nombres).toContain("validaciones");
    expect(nombres).toContain("distribuciones");

    db2.close();
  });
});
