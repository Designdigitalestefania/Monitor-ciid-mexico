import { describe, it, expect } from "vitest";
import {
  generarIdPublico,
  generarIdInterno,
  crearExpediente,
  registrarTransicion,
  expedientePerteneceATenant,
} from "../../../src/domain/expediente.js";
import { crearActor, registrarActor } from "../../../src/domain/actor.js";

describe("Expediente", () => {
  it("genera ID publico", () => {
    expect(generarIdPublico(2026, 1)).toBe("CIID-2026-0001");
    expect(generarIdPublico(2026, 42)).toBe("CIID-2026-0042");
  });
  it("rechaza secuenciales invalidos", () => {
    expect(() => generarIdPublico(2026, 0)).toThrow();
    expect(() => generarIdPublico(2026, 10000)).toThrow();
  });
  it("genera ID interno unico", () => {
    const a = generarIdInterno();
    const b = generarIdInterno();
    expect(a).not.toBe(b);
  });
  it("crea expediente en RECEIVED", () => {
    const e = crearExpediente({
      id: "CIID-2026-0001", tenantId: "monitor",
      origen: "ciudadania", territorio: { estado: "Oaxaca" },
    });
    expect(e.etapaActual).toBe("RECEIVED");
    expect(e.transiciones.length).toBe(0);
  });
  it("rechaza sin territorio", () => {
    expect(() => crearExpediente({
      id: "CIID-2026-0001", tenantId: "t",
      origen: "ciudadania", territorio: { estado: "" },
    })).toThrow();
  });
  it("registra transiciones", () => {
    const e = crearExpediente({
      id: "CIID-2026-0001", tenantId: "t",
      origen: "ciudadania", territorio: { estado: "Oaxaca" },
    });
    const actor = registrarActor(
      crearActor({ userId: "u1", nombre: "Sistema", rol: "sistema", tenantId: "t" })
    );
    const e2 = registrarTransicion(e, { hasta: "PROCESSING", actor });
    expect(e2.etapaActual).toBe("PROCESSING");
    expect(e2.transiciones.length).toBe(1);
  });
  it("verifica pertenencia al tenant", () => {
    const e = crearExpediente({
      id: "CIID-2026-0001", tenantId: "t1",
      origen: "ciudadania", territorio: { estado: "Oaxaca" },
    });
    expect(expedientePerteneceATenant(e, "t1")).toBe(true);
    expect(expedientePerteneceATenant(e, "t2")).toBe(false);
  });
});
