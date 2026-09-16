import { describe, it, expect, beforeEach } from "vitest";
import { TenantsService } from "../../src/modules/tenants/service.js";
import { IngestService } from "../../src/modules/ingest/service.js";
import { PipelineService } from "../../src/modules/pipeline/service.js";
import { PreservationService } from "../../src/modules/preservation/service.js";
import { crearActor, type Actor } from "../../src/domain/actor.js";

describe("Integracion: ciclo completo CIID hasta preservacion", () => {
  let tenants: TenantsService;
  let ingest: IngestService;
  let pipeline: PipelineService;
  let preservation: PreservationService;
  let periodista: Actor;
  let sistema: Actor;

  beforeEach(() => {
    tenants = new TenantsService();
    ingest = new IngestService();
    pipeline = new PipelineService();
    preservation = new PreservationService();

    tenants.crear({
      id: "monitor-noticias",
      nombre: "Monitor Noticias",
      tipo: "medio",
      territorioId: "oaxaca",
    });

    periodista = crearActor({
      userId: "u-p1",
      nombre: "Periodista Demo",
      rol: "periodista",
      tenantId: "monitor-noticias",
    });

    sistema = crearActor({
      userId: "sys",
      nombre: "Sistema CIID",
      rol: "sistema",
      tenantId: "monitor-noticias",
    });
  });

  it("ciclo completo: ingesta -> pipeline -> published -> preserved", () => {
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    // 1. Ingesta
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

    // 2. Avanzar hasta PUBLISHED
    let exp = r1.expediente;
    for (let i = 0; i < 3; i++) {
      const r = pipeline.avanzar({ expediente: exp, actor: sistema });
      if (!r.expediente) throw new Error("sin expediente");
      exp = r.expediente;
    }
    expect(exp.etapaActual).toBe("VERIFICATION");

    const rDecision = pipeline.avanzar({
      expediente: exp,
      actor: periodista,
    });
    if (!rDecision.expediente) throw new Error("sin expediente");
    exp = rDecision.expediente;
    expect(exp.etapaActual).toBe("DECISION");

    const rPub = pipeline.aprobarPublicacion({
      expediente: exp,
      actor: periodista,
      razon: "Aprobado para publicacion",
    });
    if (!rPub.expediente) throw new Error("sin expediente");
    exp = rPub.expediente;
    expect(exp.etapaActual).toBe("PUBLISHED");

    // 3. Preservar
    const rPres = preservation.preservar({
      expediente: exp,
      actor: periodista,
    });
    expect(rPres.exito).toBe(true);
    expect(rPres.expediente?.etapaActual).toBe("PRESERVED");
    expect(rPres.registro).toBeDefined();
    expect(rPres.registro?.tenantId).toBe("monitor-noticias");
    expect(rPres.registro?.territorio.estado).toBe("Oaxaca");
    expect(rPres.registro?.hashDocumental).toContain("sha-local-");

    // 4. Historial completo
    if (!rPres.expediente) throw new Error("sin expediente");
    const hist = pipeline.historial(rPres.expediente);
    expect(hist.length).toBeGreaterThanOrEqual(6);
    expect(hist[0].desde).toBe("RECEIVED");
    expect(hist[hist.length - 1].hasta).toBe("PRESERVED");
  });

  it("archivo patrimonial aisla registros por tenant", () => {
    tenants.crear({
      id: "municipio-a",
      nombre: "Municipio A",
      tipo: "municipio",
      territorioId: "oaxaca",
    });

    const t1 = tenants.obtenerPorId("monitor-noticias");
    const t2 = tenants.obtenerPorId("municipio-a");
    if (!t1 || !t2) throw new Error("tenants faltantes");

    // Preservar en tenant 1
    const r1 = ingest.recibir(
      {
        id: "CIID-2026-0002",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      },
      t1
    );
    if (!r1.expediente) throw new Error("sin expediente");

    let exp1 = r1.expediente;
    for (let i = 0; i < 3; i++) {
      const r = pipeline.avanzar({ expediente: exp1, actor: sistema });
      if (!r.expediente) throw new Error("sin expediente");
      exp1 = r.expediente;
    }
    const rDec1 = pipeline.avanzar({ expediente: exp1, actor: periodista });
    if (!rDec1.expediente) throw new Error("sin expediente");
    const rPub1 = pipeline.aprobarPublicacion({
      expediente: rDec1.expediente,
      actor: periodista,
    });
    if (!rPub1.expediente) throw new Error("sin expediente");
    preservation.preservar({ expediente: rPub1.expediente, actor: periodista });

    // Preservar en tenant 2
    const r2 = ingest.recibir(
      {
        id: "CIID-2026-0003",
        tenantId: "municipio-a",
        origen: "institucional",
        territorio: { estado: "Oaxaca" },
      },
      t2
    );
    if (!r2.expediente) throw new Error("sin expediente");

    let exp2 = r2.expediente;
    for (let i = 0; i < 3; i++) {
      const r = pipeline.avanzar({ expediente: exp2, actor: sistema });
      if (!r.expediente) throw new Error("sin expediente");
      exp2 = r.expediente;
    }
    const rDec2 = pipeline.avanzar({ expediente: exp2, actor: periodista });
    if (!rDec2.expediente) throw new Error("sin expediente");
    const rPub2 = pipeline.aprobarPublicacion({
      expediente: rDec2.expediente,
      actor: periodista,
    });
    if (!rPub2.expediente) throw new Error("sin expediente");
    preservation.preservar({ expediente: rPub2.expediente, actor: periodista });

    // Verificar aislamiento
    expect(preservation.listarPorTenant("monitor-noticias").length).toBe(1);
    expect(preservation.listarPorTenant("municipio-a").length).toBe(1);
    expect(preservation.contar()).toBe(2);
  });

  it("expediente preservado conserva lenguas originarias", () => {
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

    // Agregar lengua manualmente
    const expConLengua = {
      ...r1.expediente,
      lenguas: [
        {
          lenguaId: "zapoteco",
          lenguaNombre: "Zapoteco",
          varianteId: "zap-sierra",
          varianteNombre: "Zapoteco de la Sierra",
          validadoPor: "hablante-001",
        },
      ],
    };

    let exp = expConLengua;
    for (let i = 0; i < 3; i++) {
      const r = pipeline.avanzar({ expediente: exp, actor: sistema });
      if (!r.expediente) throw new Error("sin expediente");
      exp = r.expediente;
    }
    const rDec = pipeline.avanzar({ expediente: exp, actor: periodista });
    if (!rDec.expediente) throw new Error("sin expediente");
    const rPub = pipeline.aprobarPublicacion({
      expediente: rDec.expediente,
      actor: periodista,
    });
    if (!rPub.expediente) throw new Error("sin expediente");

    const rPres = preservation.preservar({
      expediente: rPub.expediente,
      actor: periodista,
    });
    expect(rPres.exito).toBe(true);
    expect(rPres.registro?.lenguas.length).toBe(1);
    expect(rPres.registro?.lenguas[0].lenguaNombre).toBe("Zapoteco");
    expect(rPres.registro?.lenguas[0].validadoPor).toBe("hablante-001");
  });
});
