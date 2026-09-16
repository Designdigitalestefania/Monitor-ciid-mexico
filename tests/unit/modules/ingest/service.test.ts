import { describe, it, expect, beforeEach } from "vitest";
import { IngestService } from "../../../../src/modules/ingest/service.js";
import { TenantsService } from "../../../../src/modules/tenants/service.js";

describe("IngestService", () => {
  let ingest: IngestService;
  let tenants: TenantsService;

  beforeEach(() => {
    ingest = new IngestService();
    tenants = new TenantsService();
    tenants.crear({
      id: "monitor-noticias",
      nombre: "Monitor Noticias",
      tipo: "medio",
      territorioId: "oaxaca",
    });
  });

  it("recibe informacion y crea expediente", () => {
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    const r = ingest.recibir(
      {
        id: "CIID-2026-0001",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      },
      tenant
    );

    expect(r.exito).toBe(true);
    expect(r.expediente).toBeDefined();
    expect(r.expediente?.etapaActual).toBe("PROCESSING");
    expect(ingest.contar()).toBe(1);
  });

  it("rechaza id sin formato CIID", () => {
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    const r = ingest.recibir(
      {
        id: "otro-formato",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      },
      tenant
    );

    expect(r.exito).toBe(false);
    expect(r.razon).toContain("CIID-");
  });

  it("rechaza territorio sin estado", () => {
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    const r = ingest.recibir(
      {
        id: "CIID-2026-0002",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "" },
      },
      tenant
    );

    expect(r.exito).toBe(false);
  });

  it("rechaza tenant suspendido", () => {
    tenants.cambiarEstado("monitor-noticias", "suspendido");
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    const r = ingest.recibir(
      {
        id: "CIID-2026-0003",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      },
      tenant
    );

    expect(r.exito).toBe(false);
    expect(r.razon).toContain("suspendido");
  });

  it("rechaza expediente duplicado", () => {
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    const input = {
      id: "CIID-2026-0004",
      tenantId: "monitor-noticias",
      origen: "ciudadania" as const,
      territorio: { estado: "Oaxaca" },
    };

    ingest.recibir(input, tenant);
    const r2 = ingest.recibir(input, tenant);

    expect(r2.exito).toBe(false);
    expect(r2.razon).toContain("ya existe");
  });

  it("obtiene expediente por id", () => {
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    ingest.recibir(
      {
        id: "CIID-2026-0005",
        tenantId: "monitor-noticias",
        origen: "institucional",
        territorio: { estado: "Oaxaca" },
      },
      tenant
    );

    const e = ingest.obtenerPorId("CIID-2026-0005");
    expect(e).not.toBeNull();
    expect(e?.origen).toBe("institucional");
  });

  it("lista expedientes por tenant", () => {
    tenants.crear({
      id: "municipio-a",
      nombre: "Municipio A",
      tipo: "municipio",
      territorioId: "oaxaca",
    });

    const t1 = tenants.obtenerPorId("monitor-noticias");
    const t2 = tenants.obtenerPorId("municipio-a");
    if (!t1 || !t2) throw new Error("tenants faltantes");

    ingest.recibir(
      {
        id: "CIID-2026-0006",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      },
      t1
    );
    ingest.recibir(
      {
        id: "CIID-2026-0007",
        tenantId: "municipio-a",
        origen: "institucional",
        territorio: { estado: "Oaxaca" },
      },
      t2
    );

    expect(ingest.listarPorTenant("monitor-noticias").length).toBe(1);
    expect(ingest.listarPorTenant("municipio-a").length).toBe(1);
  });

  it("filtra por origen", () => {
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    ingest.recibir(
      {
        id: "CIID-2026-0008",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      },
      tenant
    );
    ingest.recibir(
      {
        id: "CIID-2026-0009",
        tenantId: "monitor-noticias",
        origen: "institucional",
        territorio: { estado: "Oaxaca" },
      },
      tenant
    );

    const ciudadanos = ingest.filtrar({ origen: "ciudadania" });
    expect(ciudadanos.length).toBe(1);
    expect(ciudadanos[0].id).toBe("CIID-2026-0008");
  });

  it("filtra por etapa", () => {
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    ingest.recibir(
      {
        id: "CIID-2026-0010",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      },
      tenant
    );

    const enProceso = ingest.filtrar({ etapa: "PROCESSING" });
    expect(enProceso.length).toBe(1);
  });
});
