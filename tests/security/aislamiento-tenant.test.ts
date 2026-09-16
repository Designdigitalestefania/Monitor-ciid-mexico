import { describe, it, expect } from "vitest";
import {
  crearExpediente,
  expedientePerteneceATenant,
} from "../../src/domain/expediente.js";

describe("Aislamiento entre tenants", () => {
  it("expediente del tenant A no pertenece al tenant B", () => {
    const e = crearExpediente({
      id: "CIID-2026-0001", tenantId: "tenant-a",
      origen: "ciudadania", territorio: { estado: "Oaxaca" },
    });
    expect(expedientePerteneceATenant(e, "tenant-a")).toBe(true);
    expect(expedientePerteneceATenant(e, "tenant-b")).toBe(false);
  });
  it("rechaza expediente sin tenantId", () => {
    expect(() => crearExpediente({
      id: "CIID-2026-0001", tenantId: "",
      origen: "ciudadania", territorio: { estado: "Oaxaca" },
    })).toThrow();
  });
});
