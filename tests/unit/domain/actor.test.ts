import { describe, it, expect } from "vitest";
import {
  crearActor,
  registrarActor,
  puedeDecidirPublicacion,
} from "../../../src/domain/actor.js";

describe("Actor", () => {
  it("crea periodista", () => {
    const a = crearActor({ userId: "u1", nombre: "P1", rol: "periodista", tenantId: "t" });
    expect(a.rol).toBe("periodista");
  });
  it("rechaza userId vacio", () => {
    expect(() => crearActor({ userId: "", nombre: "X", rol: "periodista", tenantId: "t" })).toThrow();
  });
  it("registra con timestamp", () => {
    const a = crearActor({ userId: "u1", nombre: "P1", rol: "periodista", tenantId: "t" });
    const reg = registrarActor(a);
    expect(reg.timestamp).toBeTruthy();
  });
  it("solo periodistas y editores deciden", () => {
    const p = crearActor({ userId: "u1", nombre: "P", rol: "periodista", tenantId: "t" });
    const e = crearActor({ userId: "u2", nombre: "E", rol: "editor", tenantId: "t" });
    const c = crearActor({ userId: "u3", nombre: "C", rol: "ciudadano", tenantId: "t" });
    expect(puedeDecidirPublicacion(p)).toBe(true);
    expect(puedeDecidirPublicacion(e)).toBe(true);
    expect(puedeDecidirPublicacion(c)).toBe(false);
  });
});
