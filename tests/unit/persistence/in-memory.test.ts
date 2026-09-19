import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryRepository } from "../../../src/persistence/in-memory.js";

interface ItemDemo {
  readonly id: string;
  readonly valor: number;
  readonly categoria: string;
}

describe("InMemoryRepository", () => {
  let repo: InMemoryRepository<ItemDemo>;

  beforeEach(() => {
    repo = new InMemoryRepository<ItemDemo>();
  });

  it("guarda y obtiene un item", () => {
    repo.guardar({ id: "a", valor: 1, categoria: "x" });
    const item = repo.obtener("a");
    expect(item).not.toBeNull();
    expect(item?.valor).toBe(1);
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

  it("elimina un item existente", () => {
    repo.guardar({ id: "a", valor: 1, categoria: "x" });
    const eliminado = repo.eliminar("a");
    expect(eliminado).toBe(true);
    expect(repo.existe("a")).toBe(false);
    expect(repo.contar()).toBe(0);
  });

  it("devuelve false al eliminar item inexistente", () => {
    const eliminado = repo.eliminar("no-existe");
    expect(eliminado).toBe(false);
  });

  it("limpia todos los items", () => {
    repo.guardar({ id: "a", valor: 1, categoria: "x" });
    repo.guardar({ id: "b", valor: 2, categoria: "y" });
    repo.limpiar();
    expect(repo.contar()).toBe(0);
    expect(repo.listar().length).toBe(0);
  });

  it("filtra por predicado", () => {
    repo.guardar({ id: "a", valor: 1, categoria: "x" });
    repo.guardar({ id: "b", valor: 2, categoria: "y" });
    repo.guardar({ id: "c", valor: 3, categoria: "x" });

    const filtrados = repo.filtrar((item) => item.categoria === "x");
    expect(filtrados.length).toBe(2);
    expect(filtrados.every((i) => i.categoria === "x")).toBe(true);
  });

  it("lista vacia al inicio", () => {
    expect(repo.listar()).toEqual([]);
    expect(repo.contar()).toBe(0);
  });
});
