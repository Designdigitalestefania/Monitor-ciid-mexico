import { describe, it, expect } from "vitest";
import {
  crearLengua,
  tomarSnapshotLengua,
  LENGUAS_PILOTO,
} from "../../../src/domain/lengua.js";

describe("Lengua", () => {
  it("crea lengua con variantes", () => {
    const l = crearLengua({
      id: "zapoteco", nombre: "Zapoteco", familia: "oto-mangue",
      variantes: [
        { id: "zap-sierra", nombre: "Zapoteco de la Sierra" },
        { id: "zap-valles", nombre: "Zapoteco de Valles" },
      ],
    });
    expect(l.variantes.length).toBe(2);
  });
  it("rechaza sin variantes", () => {
    expect(() => crearLengua({ id: "x", nombre: "X", familia: "y", variantes: [] })).toThrow();
  });
  it("toma snapshot", () => {
    const l = crearLengua({
      id: "zapoteco", nombre: "Zapoteco", familia: "oto-mangue",
      variantes: [{ id: "zap-sierra", nombre: "Zapoteco de la Sierra" }],
    });
    const snap = tomarSnapshotLengua(l, "zap-sierra", "hablante-001");
    expect(snap.lenguaNombre).toBe("Zapoteco");
    expect(snap.validadoPor).toBe("hablante-001");
  });
  it("rechaza variante inexistente", () => {
    const l = crearLengua({
      id: "zapoteco", nombre: "Zapoteco", familia: "oto-mangue",
      variantes: [{ id: "zap-sierra", nombre: "Zapoteco de la Sierra" }],
    });
    expect(() => tomarSnapshotLengua(l, "no-existe")).toThrow();
  });
  it("incluye lenguas del piloto", () => {
    expect(LENGUAS_PILOTO.zapoteco).toBe("zapoteco");
    expect(LENGUAS_PILOTO.mixteco).toBe("mixteco");
    expect(LENGUAS_PILOTO.mazateco).toBe("mazateco");
  });
});
