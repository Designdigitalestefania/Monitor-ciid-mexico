import { describe, it, expect } from "vitest";
import {
  crearTenant,
  mismoTenant,
  aceptaParticipacionCiudadana,
} from "../../../src/domain/tenant.js";

describe("Tenant", () => {
  it("crea tenant valido", () => {
    const t = crearTenant({ id: "monitor", nombre: "Monitor", tipo: "medio", territorioId: "oaxaca" });
    expect(t.estado).toBe("activo");
  });
  it("rechaza id vacio", () => {
    expect(() => crearTenant({ id: "", nombre: "X", tipo: "medio", territorioId: "y" })).toThrow();
  });
  it("compara tenants", () => {
    const a = crearTenant({ id: "a", nombre: "A", tipo: "medio", territorioId: "t" });
    const b = crearTenant({ id: "a", nombre: "A", tipo: "medio", territorioId: "t" });
    const c = crearTenant({ id: "c", nombre: "C", tipo: "medio", territorioId: "t" });
    expect(mismoTenant(a, b)).toBe(true);
    expect(mismoTenant(a, c)).toBe(false);
  });
  it("respeta config de ciudadania", () => {
    const t = crearTenant({
      id: "x", nombre: "X", tipo: "institucion", territorioId: "t",
      configuracion: { permiteParticipacionCiudadana: false },
    });
    expect(aceptaParticipacionCiudadana(t)).toBe(false);
  });
});
