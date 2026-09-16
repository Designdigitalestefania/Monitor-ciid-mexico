import { describe, it, expect, beforeEach } from "vitest";
import { LinguisticService } from "../../src/modules/linguistic/service.js";
import { TenantsService } from "../../src/modules/tenants/service.js";
import { IngestService } from "../../src/modules/ingest/service.js";
import { PipelineService } from "../../src/modules/pipeline/service.js";
import { PreservationService } from "../../src/modules/preservation/service.js";
import { crearActor, type Actor } from "../../src/domain/actor.js";

describe("Integracion: validacion linguistica en el pipeline", () => {
  let linguistic: LinguisticService;
  let tenants: TenantsService;
  let ingest: IngestService;
  let pipeline: PipelineService;
  let preservation: PreservationService;
  let periodista: Actor;

  beforeEach(() => {
    linguistic = new LinguisticService();
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
      nombre: "Periodista",
      rol: "periodista",
      tenantId: "monitor-noticias",
    });
  });

  it("flujo completo: hablante -> validacion -> expediente preservado", () => {
    // 1. Acreditar hablante nativo
    const rHab = linguistic.acreditarHablante({
      id: "HAB-001",
      tenantId: "monitor-noticias",
      nombre: "Hablante Demo",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
      comunidadReferencia: "Sierra Norte",
      acreditadoPor: "u-coordinador",
    });
    expect(rHab.exito).toBe(true);

    // 2. Ingestar expediente con lengua
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    const rIng = ingest.recibir(
      {
        id: "CIID-2026-0001",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca", region: "Sierra Norte" },
      },
      tenant
    );
    if (!rIng.expediente) throw new Error("sin expediente");

    // 3. Registrar validacion linguistica
    const rVal = linguistic.registrarValidacion({
      id: "VAL-001",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-001",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
      comentario: "Revision inicial",
    });
    expect(rVal.exito).toBe(true);
    expect(rVal.validacion?.estado).toBe("pendiente");

    // 4. Aprobar validacion
    const rApr = linguistic.aprobarValidacion("VAL-001");
    expect(rApr.exito).toBe(true);
    expect(rApr.validacion?.estado).toBe("validada");

    // 5. Avanzar pipeline hasta PUBLISHED
    let exp = rIng.expediente;
    for (let i = 0; i < 3; i++) {
      const r = pipeline.avanzar({ expediente: exp, actor: periodista });
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

    // 6. Preservar
    const rPres = preservation.preservar({
      expediente: rPub.expediente,
      actor: periodista,
    });
    expect(rPres.exito).toBe(true);
    expect(rPres.expediente?.etapaActual).toBe("PRESERVED");
  });

  it("no se puede validar sin hablante acreditado", () => {
    const r = linguistic.registrarValidacion({
      id: "VAL-002",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-999",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
    });
    expect(r.exito).toBe(false);
  });

  it("hablantes se aislan por tenant", () => {
    tenants.crear({
      id: "municipio-a",
      nombre: "Municipio A",
      tipo: "municipio",
      territorioId: "oaxaca",
    });

    linguistic.acreditarHablante({
      id: "HAB-010",
      tenantId: "monitor-noticias",
      nombre: "Hab 1",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
      comunidadReferencia: "Sierra Norte",
      acreditadoPor: "u",
    });
    linguistic.acreditarHablante({
      id: "HAB-011",
      tenantId: "municipio-a",
      nombre: "Hab 2",
      lenguaId: "mixteco",
      varianteId: "mix-alta",
      comunidadReferencia: "Mixteca",
      acreditadoPor: "u",
    });

    expect(linguistic.listarHablantesPorTenant("monitor-noticias").length).toBe(1);
    expect(linguistic.listarHablantesPorTenant("municipio-a").length).toBe(1);
  });

  it("rechazar validacion no afecta al expediente", () => {
    linguistic.acreditarHablante({
      id: "HAB-020",
      tenantId: "monitor-noticias",
      nombre: "Hab",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
      comunidadReferencia: "Sierra Norte",
      acreditadoPor: "u",
    });

    linguistic.registrarValidacion({
      id: "VAL-020",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-020",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
    });
    linguistic.rechazarValidacion("VAL-020", "Variante incorrecta");

    const val = linguistic.obtenerValidacion("VAL-020");
    expect(val?.estado).toBe("rechazada");
    expect(val?.motivoRechazo).toBe("Variante incorrecta");
  });

  it("filtrar validaciones por tenant", () => {
    linguistic.acreditarHablante({
      id: "HAB-030",
      tenantId: "monitor-noticias",
      nombre: "Hab",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
      comunidadReferencia: "Sierra Norte",
      acreditadoPor: "u",
    });

    linguistic.registrarValidacion({
      id: "VAL-030",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-030",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
    });

    const filtradas = linguistic.filtrar({ tenantId: "monitor-noticias" });
    expect(filtradas.length).toBe(1);
    expect(filtradas[0].tenantId).toBe("monitor-noticias");
  });
});
