import { describe, it, expect, beforeEach } from "vitest";
import { MetricsService } from "../../../../src/modules/metrics/service.js";
import { crearExpediente } from "../../../../src/domain/expediente.js";

describe("MetricsService", () => {
  let metrics: MetricsService;

  beforeEach(() => {
    metrics = new MetricsService({
      expedientes: [
        crearExpediente({
          id: "CIID-2026-0001",
          tenantId: "monitor-noticias",
          origen: "ciudadania",
          territorio: { estado: "Oaxaca" },
        }),
        crearExpediente({
          id: "CIID-2026-0002",
          tenantId: "monitor-noticias",
          origen: "institucional",
          territorio: { estado: "Oaxaca" },
        }),
        crearExpediente({
          id: "CIID-2026-0003",
          tenantId: "municipio-a",
          origen: "ciudadania",
          territorio: { estado: "Oaxaca" },
        }),
      ],
      distribuciones: [
        {
          id: "DIS-001",
          expedienteId: "CIID-2026-0001",
          tenantId: "monitor-noticias",
          canal: "web",
          version: 1,
          titulo: "T",
          cuerpo: "C",
          estado: "activa",
          creadaEn: new Date().toISOString(),
          creadaPor: "u-p1",
          retiradaEn: null,
          motivoRetiro: null,
        },
        {
          id: "DIS-002",
          expedienteId: "CIID-2026-0001",
          tenantId: "monitor-noticias",
          canal: "facebook",
          version: 1,
          titulo: "T",
          cuerpo: "C",
          estado: "activa",
          creadaEn: new Date().toISOString(),
          creadaPor: "u-p1",
          retiradaEn: null,
          motivoRetiro: null,
        },
        {
          id: "DIS-003",
          expedienteId: "CIID-2026-0002",
          tenantId: "monitor-noticias",
          canal: "web",
          version: 1,
          titulo: "T",
          cuerpo: "C",
          estado: "activa",
          creadaEn: new Date().toISOString(),
          creadaPor: "u-p1",
          retiradaEn: null,
          motivoRetiro: null,
        },
      ],
      validaciones: [
        {
          id: "VAL-001",
          expedienteId: "CIID-2026-0001",
          tenantId: "monitor-noticias",
          hablanteId: "HAB-001",
          lenguaId: "zapoteco",
          varianteId: "zap-sierra",
          estado: "validada",
          comentario: null,
          creadaEn: new Date().toISOString(),
          validadaEn: new Date().toISOString(),
          rechazadaEn: null,
          motivoRechazo: null,
        },
        {
          id: "VAL-002",
          expedienteId: "CIID-2026-0002",
          tenantId: "monitor-noticias",
          hablanteId: "HAB-001",
          lenguaId: "zapoteco",
          varianteId: "zap-sierra",
          estado: "pendiente",
          comentario: null,
          creadaEn: new Date().toISOString(),
          validadaEn: null,
          rechazadaEn: null,
          motivoRechazo: null,
        },
      ],
      reportesCiudadanos: [
        {
          id: "CIU-2026-0001",
          tenantId: "monitor-noticias",
          canal: "whatsapp",
          territorio: { estado: "Oaxaca" },
          lenguas: [],
          consentimiento: {
            otorgado: true,
            fecha: new Date().toISOString(),
            usoInformativo: true,
            usoPatrimonial: false,
          },
          estado: "activo",
          expedienteId: null,
          creadoEn: new Date().toISOString(),
          retiradoEn: null,
          motivoRetiro: null,
        },
      ],
    });
  });

  it("genera resumen completo por tenant", () => {
    const r = metrics.resumenTenant("monitor-noticias");
    expect(r).not.toBeNull();
    expect(r?.totalExpedientes).toBe(2);
    expect(r?.totalDistribuciones).toBe(3);
    expect(r?.totalValidaciones).toBe(2);
    expect(r?.totalReportesCiudadanos).toBe(1);
  });

  it("devuelve null si tenantId vacio", () => {
    expect(metrics.resumenTenant("")).toBeNull();
  });

  it("agrupa expedientes por etapa", () => {
    const r = metrics.resumenTenant("monitor-noticias");
    expect(r?.expedientesPorEtapa.length).toBeGreaterThan(0);
    const recepcion = r?.expedientesPorEtapa.find((e) => e.etapa === "RECEIVED");
    expect(recepcion?.total).toBe(2);
  });

  it("agrupa distribuciones por canal", () => {
    const r = metrics.resumenTenant("monitor-noticias");
    const web = r?.distribucionesPorCanal.find((c) => c.canal === "web");
    expect(web?.total).toBe(2);
    const fb = r?.distribucionesPorCanal.find((c) => c.canal === "facebook");
    expect(fb?.total).toBe(1);
  });

  it("agrupa validaciones por estado", () => {
    const r = metrics.resumenTenant("monitor-noticias");
    const validadas = r?.validacionesPorEstado.find((v) => v.estado === "validada");
    expect(validadas?.total).toBe(1);
  });

  it("aísla metricas por tenant", () => {
    const r1 = metrics.resumenTenant("monitor-noticias");
    const r2 = metrics.resumenTenant("municipio-a");
    expect(r1?.totalExpedientes).toBe(2);
    expect(r2?.totalExpedientes).toBe(1);
  });

  it("cuenta expedientes por etapa", () => {
    const conteos = metrics.conteoPorEtapa("monitor-noticias");
    expect(conteos.length).toBeGreaterThan(0);
  });

  it("cuenta distribuciones por canal", () => {
    const conteos = metrics.conteoPorCanal("monitor-noticias");
    expect(conteos.length).toBe(2);
  });

  it("cuenta validaciones por estado", () => {
    const conteos = metrics.conteoValidaciones("monitor-noticias");
    expect(conteos.length).toBe(2);
  });

  it("cuenta reportes ciudadanos por estado", () => {
    const conteos = metrics.conteoCiudadano("monitor-noticias");
    expect(conteos.length).toBe(1);
    expect(conteos[0].estado).toBe("activo");
  });

  it("genera reporte por rango de fechas", () => {
    const ahora = new Date();
    const hace5 = new Date(ahora.getTime() - 5 * 24 * 60 * 60 * 1000);
    const mas5 = new Date(ahora.getTime() + 5 * 24 * 60 * 60 * 1000);

    const r = metrics.reportePorRango("monitor-noticias", {
      desde: hace5.toISOString(),
      hasta: mas5.toISOString(),
    });

    expect(r.exito).toBe(true);
    expect(r.resumen?.totalExpedientes).toBe(2);
  });

  it("rechaza reporte con rango invalido", () => {
    const r = metrics.reportePorRango("monitor-noticias", {
      desde: "2026-12-31T00:00:00Z",
      hasta: "2026-01-01T00:00:00Z",
    });
    expect(r.exito).toBe(false);
  });

  it("devuelve vacio si tenant sin datos", () => {
    const r = metrics.conteoPorEtapa("tenant-vacio");
    expect(r.length).toBe(0);
  });
});
