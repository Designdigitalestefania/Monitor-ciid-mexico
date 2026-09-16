import { describe, it, expect, beforeEach } from "vitest";
import { CitizenService } from "../../src/modules/citizen/service.js";
import { TenantsService } from "../../src/modules/tenants/service.js";
import { IngestService } from "../../src/modules/ingest/service.js";
import { PipelineService } from "../../src/modules/pipeline/service.js";
import { PreservationService } from "../../src/modules/preservation/service.js";
import { crearActor, type Actor } from "../../src/domain/actor.js";

describe("Integracion: reporte ciudadano hasta preservacion", () => {
  let citizen: CitizenService;
  let tenants: TenantsService;
  let ingest: IngestService;
  let pipeline: PipelineService;
  let preservation: PreservationService;
  let periodista: Actor;

  beforeEach(() => {
    citizen = new CitizenService();
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

  it("flujo completo: reporte ciudadano -> ingesta -> pipeline -> preserved", () => {
    // 1. Ciudadano registra reporte
    const rCitizen = citizen.registrar({
      id: "CIU-2026-0001",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "Oaxaca", region: "Sierra Norte" },
      lenguas: [
        {
          lenguaId: "zapoteco",
          lenguaNombre: "Zapoteco",
          varianteId: "zap-sierra",
          varianteNombre: "Zapoteco de la Sierra",
          validadoPor: "hablante-001",
        },
      ],
      consentimiento: {
        otorgado: true,
        fecha: "2026-09-15T12:00:00Z",
        usoInformativo: true,
        usoPatrimonial: true,
      },
    });
    expect(rCitizen.exito).toBe(true);
    expect(rCitizen.registro?.estado).toBe("activo");

    // 2. Ingesta crea expediente
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    const rIngest = ingest.recibir(
      {
        id: "CIID-2026-0001",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: rCitizen.registro!.territorio,
      },
      tenant
    );
    expect(rIngest.exito).toBe(true);
    if (!rIngest.expediente) throw new Error("sin expediente");

    // 3. Vincular reporte al expediente
    const rVinculo = citizen.vincularAExpediente(
      "CIU-2026-0001",
      "CIID-2026-0001"
    );
    expect(rVinculo.exito).toBe(true);
    expect(rVinculo.registro?.estado).toBe("vinculado");

    // 4. Avanzar pipeline hasta PUBLISHED
    let exp = rIngest.expediente;
    for (let i = 0; i < 3; i++) {
      const r = pipeline.avanzar({ expediente: exp, actor: periodista });
      if (!r.expediente) throw new Error("sin expediente");
      exp = r.expediente;
    }
    const rDecision = pipeline.avanzar({
      expediente: exp,
      actor: periodista,
    });
    if (!rDecision.expediente) throw new Error("sin expediente");
    const rPub = pipeline.aprobarPublicacion({
      expediente: rDecision.expediente,
      actor: periodista,
    });
    if (!rPub.expediente) throw new Error("sin expediente");
    expect(rPub.expediente.etapaActual).toBe("PUBLISHED");

    // 5. Preservar
    const rPres = preservation.preservar({
      expediente: rPub.expediente,
      actor: periodista,
    });
    expect(rPres.exito).toBe(true);
    expect(rPres.expediente?.etapaActual).toBe("PRESERVED");
    expect(preservation.contar()).toBe(1);
  });

  it("reporte ciudadano se aisla por tenant", () => {
    tenants.crear({
      id: "municipio-a",
      nombre: "Municipio A",
      tipo: "municipio",
      territorioId: "oaxaca",
    });

    citizen.registrar({
      id: "CIU-2026-0002",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "Oaxaca" },
      consentimiento: {
        otorgado: true,
        fecha: "2026-09-15T12:00:00Z",
        usoInformativo: true,
        usoPatrimonial: false,
      },
    });
    citizen.registrar({
      id: "CIU-2026-0003",
      tenantId: "municipio-a",
      canal: "web",
      territorio: { estado: "Oaxaca" },
      consentimiento: {
        otorgado: true,
        fecha: "2026-09-15T12:00:00Z",
        usoInformativo: true,
        usoPatrimonial: false,
      },
    });

    expect(citizen.listarPorTenant("monitor-noticias").length).toBe(1);
    expect(citizen.listarPorTenant("municipio-a").length).toBe(1);
  });

  it("reporte retirado no llega al pipeline", () => {
    citizen.registrar({
      id: "CIU-2026-0004",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "Oaxaca" },
      consentimiento: {
        otorgado: true,
        fecha: "2026-09-15T12:00:00Z",
        usoInformativo: true,
        usoPatrimonial: false,
      },
    });

    citizen.retirar("CIU-2026-0004", "Solicitud de la comunidad");

    const r = citizen.vincularAExpediente("CIU-2026-0004", "CIID-2026-0001");
    expect(r.exito).toBe(false);
  });

  it("reporte con consentimiento dual conserva lenguas", () => {
    const r = citizen.registrar({
      id: "CIU-2026-0005",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "Oaxaca" },
      lenguas: [
        {
          lenguaId: "mixteco",
          lenguaNombre: "Mixteco",
          varianteId: "mix-alta",
          varianteNombre: "Mixteco de la Mixteca Alta",
          validadoPor: "hablante-002",
        },
      ],
      consentimiento: {
        otorgado: true,
        fecha: "2026-09-15T12:00:00Z",
        usoInformativo: true,
        usoPatrimonial: true,
      },
    });

    expect(r.exito).toBe(true);
    expect(r.registro?.lenguas.length).toBe(1);
    expect(r.registro?.lenguas[0].lenguaNombre).toBe("Mixteco");
    expect(r.registro?.consentimiento.usoPatrimonial).toBe(true);
  });
});
