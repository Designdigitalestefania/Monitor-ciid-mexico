import { describe, it, expect, beforeEach } from "vitest";
import { IngestService } from "../../src/modules/ingest/service.js";
import { TenantsService } from "../../src/modules/tenants/service.js";
import { validarTransicion } from "../../src/domain/etapa.js";
import { crearActor, registrarActor } from "../../src/domain/actor.js";
import { registrarTransicion } from "../../src/domain/expediente.js";

describe("Integracion: ingest + pipeline", () => {
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

  it("flujo completo: ingesta -> processing con trazabilidad", () => {
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    const resultado = ingest.recibir(
      {
        id: "CIID-2026-0001",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca", region: "Sierra Norte" },
      },
      tenant
    );

    expect(resultado.exito).toBe(true);
    const exp = resultado.expediente;
    if (!exp) throw new Error("expediente faltante");

    expect(exp.transiciones.length).toBe(1);
    expect(exp.transiciones[0].desde).toBe("RECEIVED");
    expect(exp.transiciones[0].hasta).toBe("PROCESSING");
    expect(exp.transiciones[0].actor.rol).toBe("sistema");
    expect(exp.transiciones[0].timestamp).toBeTruthy();
  });

  it("no permite publicar sin pasar por DECISION con actor humano", () => {
    const r1 = validarTransicion("VERIFICATION", "PUBLISHED");
    expect(r1.valida).toBe(false);

    const r2 = validarTransicion("VERIFICATION", "DECISION", false);
    expect(r2.valida).toBe(false);

    const r3 = validarTransicion("VERIFICATION", "DECISION", true);
    expect(r3.valida).toBe(true);
  });

  it("registra actor humano cuando decide publicar", () => {
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    const recibido = ingest.recibir(
      {
        id: "CIID-2026-0002",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      },
      tenant
    );

    if (!recibido.expediente) throw new Error("expediente faltante");

    const periodista = registrarActor(
      crearActor({
        userId: "u-periodista-1",
        nombre: "Periodista Demo",
        rol: "periodista",
        tenantId: "monitor-noticias",
      })
    );

    const enDecision = registrarTransicion(recibido.expediente, {
      hasta: "CLASSIFIED",
      actor: periodista,
      razon: "Avanza desde ingesta",
    });

    expect(enDecision.etapaActual).toBe("CLASSIFIED");
    expect(enDecision.transiciones.length).toBe(2);
    expect(enDecision.transiciones[1].actor.rol).toBe("periodista");
  });

  it("aismla expedientes entre tenants", () => {
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
        id: "CIID-2026-0003",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      },
      t1
    );
    ingest.recibir(
      {
        id: "CIID-2026-0004",
        tenantId: "municipio-a",
        origen: "institucional",
        territorio: { estado: "Oaxaca" },
      },
      t2
    );

    const delMonitor = ingest.listarPorTenant("monitor-noticias");
    const delMunicipio = ingest.listarPorTenant("municipio-a");

    expect(delMonitor.length).toBe(1);
    expect(delMunicipio.length).toBe(1);
    expect(delMonitor[0].tenantId).toBe("monitor-noticias");
    expect(delMunicipio[0].tenantId).toBe("municipio-a");
  });
});
