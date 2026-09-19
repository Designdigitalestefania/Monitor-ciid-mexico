import { describe, it, expect, beforeEach } from "vitest";
import { DistributionService } from "../../src/modules/distribution/service.js";
import { TenantsService } from "../../src/modules/tenants/service.js";
import { IngestService } from "../../src/modules/ingest/service.js";
import { PipelineService } from "../../src/modules/pipeline/service.js";
import { PreservationService } from "../../src/modules/preservation/service.js";
import { crearActor, type Actor } from "../../src/domain/actor.js";

describe("Integracion: distribucion multiformato", () => {
  let distribution: DistributionService;
  let tenants: TenantsService;
  let ingest: IngestService;
  let pipeline: PipelineService;
  let preservation: PreservationService;
  let periodista: Actor;

  beforeEach(() => {
    distribution = new DistributionService();
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

  async function crearExpedientePublicado(): Promise<string> {
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

    preservation.preservar({
      expediente: rPub.expediente,
      actor: periodista,
    });

    return "CIID-2026-0001";
  }

  it("flujo completo: expediente publicado -> varias distribuciones -> preservado", async () => {
    const expId = await crearExpedientePublicado();

    const r1 = distribution.distribuir({
      id: "DIS-001",
      expedienteId: expId,
      tenantId: "monitor-noticias",
      canal: "web",
      titulo: "Arranca obra vial en Oaxaca",
      cuerpo: "Nota completa en el sitio web.",
      creadaPor: "u-p1",
    });
    expect(r1.exito).toBe(true);

    const r2 = distribution.distribuir({
      id: "DIS-002",
      expedienteId: expId,
      tenantId: "monitor-noticias",
      canal: "facebook",
      titulo: "Arranca obra vial en Oaxaca",
      cuerpo: "Post breve para redes.",
      creadaPor: "u-p1",
    });
    expect(r2.exito).toBe(true);

    const r3 = distribution.distribuir({
      id: "DIS-003",
      expedienteId: expId,
      tenantId: "monitor-noticias",
      canal: "radio-comunitaria",
      titulo: "Obra vial en marcha",
      cuerpo: "Guion de 3 minutos para radio comunitaria.",
      creadaPor: "u-p1",
    });
    expect(r3.exito).toBe(true);

    expect(distribution.listarPorExpediente(expId).length).toBe(3);
    expect(distribution.contar()).toBe(3);
  });

  it("distribuciones se aislan por tenant", async () => {
    tenants.crear({
      id: "municipio-a",
      nombre: "Municipio A",
      tipo: "municipio",
      territorioId: "oaxaca",
    });

    const expId = await crearExpedientePublicado();

    distribution.distribuir({
      id: "DIS-010",
      expedienteId: expId,
      tenantId: "monitor-noticias",
      canal: "web",
      titulo: "Titulo 1",
      cuerpo: "Cuerpo 1",
      creadaPor: "u-p1",
    });
    distribution.distribuir({
      id: "DIS-011",
      expedienteId: "CIID-2026-0099",
      tenantId: "municipio-a",
      canal: "web",
      titulo: "Titulo 2",
      cuerpo: "Cuerpo 2",
      creadaPor: "u-p2",
    });

    expect(distribution.listarPorTenant("monitor-noticias").length).toBe(1);
    expect(distribution.listarPorTenant("municipio-a").length).toBe(1);
  });

  it("retirar una distribucion no afecta al expediente", async () => {
    const expId = await crearExpedientePublicado();

    distribution.distribuir({
      id: "DIS-020",
      expedienteId: expId,
      tenantId: "monitor-noticias",
      canal: "x",
      titulo: "Titulo",
      cuerpo: "Cuerpo",
      creadaPor: "u-p1",
    });

    const r = distribution.retirar("DIS-020", "Error en el titular");
    expect(r.exito).toBe(true);
    expect(r.distribucion?.estado).toBe("retirada");

    const todas = distribution.listarPorExpediente(expId);
    expect(todas.length).toBe(1);
    expect(todas[0].estado).toBe("retirada");
  });

  it("versionado por canal en un mismo expediente", async () => {
    const expId = await crearExpedientePublicado();

    distribution.distribuir({
      id: "DIS-030",
      expedienteId: expId,
      tenantId: "monitor-noticias",
      canal: "web",
      titulo: "v1",
      cuerpo: "cuerpo v1",
      creadaPor: "u-p1",
    });

    const r = distribution.distribuir({
      id: "DIS-031",
      expedienteId: expId,
      tenantId: "monitor-noticias",
      canal: "web",
      titulo: "v2 corregido",
      cuerpo: "cuerpo v2",
      creadaPor: "u-p1",
    });

    expect(r.distribucion?.version).toBe(2);
  });

  it("filtrar distribuciones por canal", async () => {
    const expId = await crearExpedientePublicado();

    distribution.distribuir({
      id: "DIS-040",
      expedienteId: expId,
      tenantId: "monitor-noticias",
      canal: "web",
      titulo: "T1",
      cuerpo: "C1",
      creadaPor: "u-p1",
    });
    distribution.distribuir({
      id: "DIS-041",
      expedienteId: expId,
      tenantId: "monitor-noticias",
      canal: "youtube",
      titulo: "T2",
      cuerpo: "C2",
      creadaPor: "u-p1",
    });

    const web = distribution.filtrar({ canal: "web" });
    expect(web.length).toBe(1);
    expect(web[0].canal).toBe("web");
  });
});
