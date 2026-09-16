import { describe, it, expect, beforeEach } from "vitest";
import { TenantsService } from "../../../../src/modules/tenants/service.js";

describe("TenantsService", () => {
  let service: TenantsService;

  beforeEach(() => {
    service = new TenantsService();
  });

  it("crea un tenant nuevo", () => {
    const t = service.crear({
      id: "monitor-noticias",
      nombre: "Monitor Noticias",
      tipo: "medio",
      territorioId: "oaxaca",
    });
    expect(t.id).toBe("monitor-noticias");
    expect(t.estado).toBe("activo");
    expect(service.contar()).toBe(1);
  });

  it("rechaza crear tenant duplicado", () => {
    service.crear({
      id: "monitor-noticias",
      nombre: "Monitor Noticias",
      tipo: "medio",
      territorioId: "oaxaca",
    });
    expect(() =>
      service.crear({
        id: "monitor-noticias",
        nombre: "Otro",
        tipo: "medio",
        territorioId: "oaxaca",
      })
    ).toThrow();
  });

  it("obtiene tenant por id", () => {
    service.crear({
      id: "municipio-a",
      nombre: "Municipio A",
      tipo: "municipio",
      territorioId: "oaxaca",
    });
    const t = service.obtenerPorId("municipio-a");
    expect(t).not.toBeNull();
    expect(t?.nombre).toBe("Municipio A");
  });

  it("devuelve null si el tenant no existe", () => {
    expect(service.obtenerPorId("no-existe")).toBeNull();
  });

  it("lista todos los tenants", () => {
    service.crear({ id: "a", nombre: "A", tipo: "medio", territorioId: "t" });
    service.crear({ id: "b", nombre: "B", tipo: "municipio", territorioId: "t" });
    expect(service.listar().length).toBe(2);
  });

  it("filtra por tipo", () => {
    service.crear({ id: "a", nombre: "A", tipo: "medio", territorioId: "t" });
    service.crear({ id: "b", nombre: "B", tipo: "municipio", territorioId: "t" });
    const medios = service.filtrar({ tipo: "medio" });
    expect(medios.length).toBe(1);
    expect(medios[0].id).toBe("a");
  });

  it("filtra por estado", () => {
    service.crear({ id: "a", nombre: "A", tipo: "medio", territorioId: "t" });
    service.cambiarEstado("a", "suspendido");
    const activos = service.filtrar({ estado: "activo" });
    expect(activos.length).toBe(0);
  });

  it("verifica operacion permitida en tenant activo", () => {
    service.crear({ id: "a", nombre: "A", tipo: "medio", territorioId: "t" });
    const r = service.verificarOperacion("a");
    expect(r.permitido).toBe(true);
  });

  it("verifica operacion denegada en tenant suspendido", () => {
    service.crear({ id: "a", nombre: "A", tipo: "medio", territorioId: "t" });
    service.cambiarEstado("a", "suspendido");
    const r = service.verificarOperacion("a");
    expect(r.permitido).toBe(false);
  });

  it("verifica operacion denegada si tenant no existe", () => {
    const r = service.verificarOperacion("no-existe");
    expect(r.permitido).toBe(false);
  });

  it("permite participacion ciudadana por defecto", () => {
    service.crear({ id: "a", nombre: "A", tipo: "medio", territorioId: "t" });
    const r = service.verificarParticipacion("a");
    expect(r.permitido).toBe(true);
  });

  it("cambia estado de tenant", () => {
    service.crear({ id: "a", nombre: "A", tipo: "medio", territorioId: "t" });
    const actualizado = service.cambiarEstado("a", "suspendido");
    expect(actualizado.estado).toBe("suspendido");
  });

  it("rechaza cambiar estado de tenant inexistente", () => {
    expect(() => service.cambiarEstado("no-existe", "suspendido")).toThrow();
  });
});
