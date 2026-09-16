import { describe, it, expect, beforeEach } from "vitest";
import { TenantsService } from "../../src/modules/tenants/service.js";
import { IngestService } from "../../src/modules/ingest/service.js";
import { PipelineService } from "../../src/modules/pipeline/service.js";
import { crearActor, type Actor } from "../../src/domain/actor.js";

describe("Integracion: flujo completo CIID", () => {
  let tenants: TenantsService;
  let ingest: IngestService;
  let pipeline: PipelineService;
  let periodista: Actor;
  let verificador: Actor;

  beforeEach(() => {
    tenants = new TenantsService();
    ingest = new IngestService();
    pipeline = new PipelineService();

    tenants.crear({
      id: "monitor-noticias",
      nombre: "Monitor Noticias",
      tipo: "medio",
      territorioId: "oaxaca",
    });

    periodista = crearActor({
      userId: "u-p1",
      nombre: "Periodista",
      rol: "periodista",
      tenantId: "monitor-noticias",
    });

    verificador = crearActor({
      userId: "u-v1",
      nombre: "Verificador",
      rol: "verificador",
      tenantId: "monitor-noticias",
    });
  });

  it("flujo completo: ingesta -> process -> classify -> editorial -> verificacion -> decision -> published", () => {
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    const r1 = ingest.recibir(
      {
        id: "CIID-2026-0001",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca", region: "Sierra Norte" },
      },
      tenant
    );
    expect(r1.exito).toBe(true);
    if (!r1.expediente) throw new Error("sin expediente");

    const r2 = pipeline.avanzar({ expediente: r1.expediente, actor: periodista });
    expect(r2.exito).toBe(true);
    if (!r2.expediente) throw new Error("sin expediente");
    expect(r2.expediente.etapaActual).toBe("CLASSIFIED");

    const r3 = pipeline.avanzar({ expediente: r2.expediente, actor: periodista });
    expect(r3.exito).toBe(true);
    if (!r3.expediente) throw new Error("sin expediente");
    expect(r3.expediente.etapaActual).toBe("EDITORIAL_REVIEW");

    const r4 = pipeline.avanzar({ expediente: r3.expediente, actor: periodista });
    expect(r4.exito).toBe(true);
    if (!r4.expediente) throw new Error("sin expediente");
    expect(r4.expediente.etapaActual).toBe("VERIFICATION");

    const r5 = pipeline.avanzar({ expediente: r4.expediente, actor: periodista });
    expect(r5.exito).toBe(true);
    if (!r5.expediente) throw new Error("sin expediente");
    expect(r5.expediente.etapaActual).toBe("DECISION");

    const r6 = pipeline.aprobarPublicacion({
      expediente: r5.expediente,
      actor: periodista,
      razon: "Aprobado por mesa editorial",
    });
    expect(r6.exito).toBe(true);
    if (!r6.expediente) throw new Error("sin expediente");
    expect(r6.expediente.etapaActual).toBe("PUBLISHED");

    const hist = pipeline.historial(r6.expediente);
    expect(hist.length).toBe(6);
    expect(hist[0].desde).toBe("RECEIVED");
    expect(hist[hist.length - 1].hasta).toBe("PUBLISHED");
  });

  it("no permite saltar de VERIFICATION a PUBLISHED", () => {
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    const r1 = ingest.recibir(
      {
        id: "CIID-2026-0002",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      },
      tenant
    );
    if (!r1.expediente) throw new Error("sin expediente");

    let exp = r1.expediente;
    for (let i = 0; i < 3; i++) {
      const r = pipeline.avanzar({ expediente: exp, actor: periodista });
      if (!r.expediente) throw new Error("sin expediente");
      exp = r.expediente;
    }
    expect(exp.etapaActual).toBe("VERIFICATION");

    const r = pipeline.aprobarPublicacion({ expediente: exp, actor: periodista });
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("DECISION");
  });

  it("un verificador no puede aprobar publicacion", () => {
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    const r1 = ingest.recibir(
      {
        id: "CIID-2026-0003",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      },
      tenant
    );
    if (!r1.expediente) throw new Error("sin expediente");

    let exp = r1.expediente;
    for (let i = 0; i < 4; i++) {
      const r = pipeline.avanzar({ expediente: exp, actor: periodista });
      if (!r.expediente) throw new Error("sin expediente");
      exp = r.expediente;
    }
    expect(exp.etapaActual).toBe("DECISION");

    const r = pipeline.aprobarPublicacion({ expediente: exp, actor: verificador });
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("periodistas");
  });

  it("devuelve expediente a editorial con razon obligatoria", () => {
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    const r1 = ingest.recibir(
      {
        id: "CIID-2026-0004",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      },
      tenant
    );
    if (!r1.expediente) throw new Error("sin expediente");

    let exp = r1.expediente;
    for (let i = 0; i < 4; i++) {
      const r = pipeline.avanzar({ expediente: exp, actor: periodista });
      if (!r.expediente) throw new Error("sin expediente");
      exp = r.expediente;
    }

    const r = pipeline.devolver({
      expediente: exp,
      actor: periodista,
      razon: "Falta contraste con autoridad",
    });
    expect(r.exito).toBe(true);
    expect(r.expediente?.etapaActual).toBe("EDITORIAL_REVIEW");
  });

  it("registra trazabilidad completa con actores y timestamps", () => {
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    const r1 = ingest.recibir(
      {
        id: "CIID-2026-0005",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      },
      tenant
    );
    if (!r1.expediente) throw new Error("sin expediente");

    const r2 = pipeline.avanzar({
      expediente: r1.expediente,
      actor: periodista,
      razon: "Revision editorial",
    });
    if (!r2.expediente) throw new Error("sin expediente");

    const hist = pipeline.historial(r2.expediente);
    for (const entrada of hist) {
      expect(entrada.actor).toBeTruthy();
      expect(entrada.rol).toBeTruthy();
      expect(entrada.timestamp).toBeTruthy();
    }
  });
});
