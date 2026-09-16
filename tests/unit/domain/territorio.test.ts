import { describe, it, expect } from "vitest";
import {
  crearTerritorio,
  tomarSnapshot,
} from "../../../src/domain/territorio.js";

describe("Territorio", () => {
  it("crea estado sin padre", () => {
    const t = crearTerritorio({ id: "oaxaca", nombre: "Oaxaca", nivel: "estado", padreId: null });
    expect(t.nivel).toBe("estado");
  });
  it("rechaza no-estado sin padre", () => {
    expect(() => crearTerritorio({ id: "x", nombre: "X", nivel: "municipio", padreId: null })).toThrow();
  });
  it("rechaza estado con padre", () => {
    expect(() => crearTerritorio({ id: "oaxaca", nombre: "Oaxaca", nivel: "estado", padreId: "mexico" })).toThrow();
  });
  it("toma snapshot", () => {
    const t = [
      crearTerritorio({ id: "oax", nombre: "Oaxaca", nivel: "estado", padreId: null }),
      crearTerritorio({ id: "sierra", nombre: "Sierra Norte", nivel: "region", padreId: "oax" }),
    ];
    const snap = tomarSnapshot(t);
    expect(snap.estado).toBe("Oaxaca");
    expect(snap.region).toBe("Sierra Norte");
  });
});
