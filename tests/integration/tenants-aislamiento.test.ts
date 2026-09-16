import { describe, it, expect } from "vitest";
import { TenantsService } from "../../src/modules/tenants/service.js";
import {
  crearExpediente,
  expedientePerteneceATenant,
} from "../../src/domain/expediente.js";

describe("Integracion: aislamiento entre tenants", () => {
  it("expediente creado en tenant A no pertenece al tenant B", () => {
    const service = new TenantsService();

    service.crear({
      id: "monitor-noticias",
      nombre: "Monitor Noticias",
      tipo: "medio",
      territorioId: "oaxaca",
    });
    service.crear({
      id: "municipio-a",
      nombre: "Municipio A",
      tipo: "municipio",
      territorioId: "oaxaca",
    });

    const expediente = crearExpediente({
      id: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      origen: "ciudadania",
      territorio: { estado: "Oaxaca" },
    });

    expect(expedientePerteneceATenant(expediente, "monitor-noticias")).toBe(true);
    expect(expedientePerteneceATenant(expediente, "municipio-a")).toBe(false);
  });

  it("un tenant suspendido no puede operar aunque exista el expediente", () => {
    const service = new TenantsService();
    service.crear({
      id: "monitor-noticias",
      nombre: "Monitor Noticias",
      tipo: "medio",
      territorioId: "oaxaca",
    });

    service.cambiarEstado("monitor-noticias", "suspendido");

    const r = service.verificarOperacion("monitor-noticias");
    expect(r.permitido).toBe(false);
  });

  it("dos tenants registrados no comparten el mismo id", () => {
    const service = new TenantsService();
    service.crear({ id: "a", nombre: "A", tipo: "medio", territorioId: "t" });
    service.crear({ id: "b", nombre: "B", tipo: "medio", territorioId: "t" });

    const todos = service.listar();
    const ids = new Set(todos.map((t) => t.id));
    expect(ids.size).toBe(todos.length);
  });
});
