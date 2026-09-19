import { describe, it, expect, beforeEach } from "vitest";
import { MetricsService } from "../../src/modules/metrics/service.js";
import { DistributionService } from "../../src/modules/distribution/service.js";
import { LinguisticService } from "../../src/modules/linguistic/service.js";
import { CitizenService } from "../../src/modules/citizen/service.js";
import { TenantsService } from "../../src/modules/tenants/service.js";
import { IngestService } from "../../src/modules/ingest/service.js";

describe("Integracion: metricas sobre el ecosistema completo", () => {
  let distribution: DistributionService;
  let linguistic: LinguisticService;
  let citizen: CitizenService;
  let tenants: TenantsService;
  let ingest: IngestService;

  beforeEach(() => {
    distribution = new DistributionService();
    linguistic = new LinguisticService();
    citizen = new CitizenService();
    tenants = new TenantsService();
    ingest = new IngestService();

    tenants.crear({
      id: "monitor-noticias",
      nombre: "Monitor Noticias",
      tipo: "medio",
      territorioId: "oaxaca",
    });
  });

  it("genera metricas coherentes tras alimentar el ecosistema", () => {
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    const rIng = ingest.recibir(
      {
        id: "CIID-2026-0001",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      },
      tenant
    );
    if (!rIng.expediente) throw new Error("sin expediente");
    expect(rIng.exito).toBe(true);

    linguistic.acreditarHablante({
      id: "HAB-001",
      tenantId: "monitor-noticias",
      nombre: "Hablante",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
      comunidadReferencia: "Sierra Norte",
      acreditadoPor: "u-coord",
    });
    linguistic.registrarValidacion({
      id: "VAL-001",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-001",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
    });
    linguistic.aprobarValidacion("VAL-001");

    citizen.registrar({
      id: "CIU-2026-0001",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "Oaxaca" },
      consentimiento: {
        otorgado: true,
        fecha: new Date().toISOString(),
        usoInformativo: true,
        usoPatrimonial: false,
      },
    });

    distribution.distribuir({
      id: "DIS-001",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      canal: "web",
      titulo: "Titulo",
      cuerpo: "Cuerpo",
      creadaPor: "u-p1",
    });

    const metricsLive = new MetricsService({
      expedientes: [rIng.expediente],
      distribuciones: distribution.listarPorTenant("monitor-noticias"),
      validaciones: [linguistic.obtenerValidacion("VAL-001")!],
      reportesCiudadanos: citizen.listarPorTenant("monitor-noticias"),
    });

    const resumen = metricsLive.resumenTenant("monitor-noticias");
    expect(resumen).not.toBeNull();
    expect(resumen?.totalExpedientes).toBe(1);
    expect(resumen?.totalDistribuciones).toBe(1);
    expect(resumen?.totalValidaciones).toBe(1);
    expect(resumen?.totalReportesCiudadanos).toBe(1);
  });

  it("metricas aislan tenants correctamente", () => {
    const tenantA = tenants.obtenerPorId("monitor-noticias");
    if (!tenantA) throw new Error("tenant faltante");

    tenants.crear({
      id: "municipio-a",
      nombre: "Municipio A",
      tipo: "municipio",
      territorioId: "oaxaca",
    });
    const tenantB = tenants.obtenerPorId("municipio-a");
    if (!tenantB) throw new Error("tenant B faltante");

    const rA = ingest.recibir(
      {
        id: "CIID-2026-0001",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      },
      tenantA
    );
    const rB = ingest.recibir(
      {
        id: "CIID-2026-0002",
        tenantId: "municipio-a",
        origen: "institucional",
        territorio: { estado: "Oaxaca" },
      },
      tenantB
    );

    const metricsLive = new MetricsService({
      expedientes: [rA.expediente!, rB.expediente!],
      distribuciones: [],
      validaciones: [],
      reportesCiudadanos: [],
    });

    const resumenA = metricsLive.resumenTenant("monitor-noticias");
    const resumenB = metricsLive.resumenTenant("municipio-a");

    expect(resumenA?.totalExpedientes).toBe(1);
    expect(resumenB?.totalExpedientes).toBe(1);
  });

  it("metricas de validaciones reflejan estados reales", () => {
    linguistic.acreditarHablante({
      id: "HAB-001",
      tenantId: "monitor-noticias",
      nombre: "Hab",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
      comunidadReferencia: "Sierra",
      acreditadoPor: "u",
    });

    linguistic.registrarValidacion({
      id: "VAL-001",
      expedienteId: "CIID-1",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-001",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
    });
    linguistic.aprobarValidacion("VAL-001");

    linguistic.registrarValidacion({
      id: "VAL-002",
      expedienteId: "CIID-2",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-001",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
    });

    const metricsLive = new MetricsService({
      expedientes: [],
      distribuciones: [],
      validaciones: [
        linguistic.obtenerValidacion("VAL-001")!,
        linguistic.obtenerValidacion("VAL-002")!,
      ],
      reportesCiudadanos: [],
    });

    const conteos = metricsLive.conteoValidaciones("monitor-noticias");
    const validada = conteos.find((c) => c.estado === "validada");
    const pendiente = conteos.find((c) => c.estado === "pendiente");

    expect(validada?.total).toBe(1);
    expect(pendiente?.total).toBe(1);
  });

  it("metricas de distribuciones reflejan canales reales", () => {
    distribution.distribuir({
      id: "DIS-001",
      expedienteId: "CIID-1",
      tenantId: "monitor-noticias",
      canal: "web",
      titulo: "T",
      cuerpo: "C",
      creadaPor: "u",
    });
    distribution.distribuir({
      id: "DIS-002",
      expedienteId: "CIID-1",
      tenantId: "monitor-noticias",
      canal: "facebook",
      titulo: "T",
      cuerpo: "C",
      creadaPor: "u",
    });
    distribution.distribuir({
      id: "DIS-003",
      expedienteId: "CIID-1",
      tenantId: "monitor-noticias",
      canal: "web",
      titulo: "T",
      cuerpo: "C",
      creadaPor: "u",
    });

    const metricsLive = new MetricsService({
      expedientes: [],
      distribuciones: distribution.listarPorTenant("monitor-noticias"),
      validaciones: [],
      reportesCiudadanos: [],
    });

    const conteos = metricsLive.conteoPorCanal("monitor-noticias");
    const web = conteos.find((c) => c.canal === "web");
    const fb = conteos.find((c) => c.canal === "facebook");

    expect(web?.total).toBe(2);
    expect(fb?.total).toBe(1);
  });

  it("metricas de ciudadania reflejan estados reales", () => {
    citizen.registrar({
      id: "CIU-001",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "Oaxaca" },
      consentimiento: {
        otorgado: true,
        fecha: new Date().toISOString(),
        usoInformativo: true,
        usoPatrimonial: false,
      },
    });
    citizen.registrar({
      id: "CIU-002",
      tenantId: "monitor-noticias",
      canal: "web",
      territorio: { estado: "Oaxaca" },
      consentimiento: {
        otorgado: true,
        fecha: new Date().toISOString(),
        usoInformativo: true,
        usoPatrimonial: false,
      },
    });
    citizen.retirar("CIU-002", "Solicitud de la comunidad");

    const metricsLive = new MetricsService({
      expedientes: [],
      distribuciones: [],
      validaciones: [],
      reportesCiudadanos: citizen.listarPorTenant("monitor-noticias"),
    });

    const conteos = metricsLive.conteoCiudadano("monitor-noticias");
    const activos = conteos.find((c) => c.estado === "activo");
    const retirados = conteos.find((c) => c.estado === "retirado");

    expect(activos?.total).toBe(1);
    expect(retirados?.total).toBe(1);
  });
});
