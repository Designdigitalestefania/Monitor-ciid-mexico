import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  SqliteRepository,
  crearBaseDatos,
  aplicarEsquema,
  type DatabaseSync,
} from "../../src/persistence/sqlite.js";
import { TenantsService } from "../../src/modules/tenants/service.js";
import { IngestService } from "../../src/modules/ingest/service.js";
import { PipelineService } from "../../src/modules/pipeline/service.js";
import { PreservationService } from "../../src/modules/preservation/service.js";
import { CitizenService } from "../../src/modules/citizen/service.js";
import { DistributionService } from "../../src/modules/distribution/service.js";
import { crearActor, type Actor } from "../../src/domain/actor.js";
import { type Tenant } from "../../src/domain/tenant.js";
import { type Expediente } from "../../src/domain/expediente.js";
import { type RegistroPatrimonial } from "../../src/modules/preservation/types.js";
import { type RegistroCiudadano } from "../../src/modules/citizen/types.js";
import { type Distribucion } from "../../src/modules/distribution/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const schemaPath = resolve(__dirname, "../../src/persistence/schema.sql");
const schema = readFileSync(schemaPath, "utf-8");

describe("Integracion SQLite: persistencia real entre servicios", () => {
  let db: DatabaseSync;
  let tenantsRepo: SqliteRepository<Tenant>;
  let expedientesRepo: SqliteRepository<Expediente>;
  let preservacionRepo: SqliteRepository<RegistroPatrimonial>;
  let ciudadanoRepo: SqliteRepository<RegistroCiudadano>;
  let distribucionRepo: SqliteRepository<Distribucion>;

  let tenants: TenantsService;
  let ingest: IngestService;
  let pipeline: PipelineService;
  let preservation: PreservationService;
  let citizen: CitizenService;
  let distribution: DistributionService;

  let periodista: Actor;

  beforeEach(() => {
    db = crearBaseDatos(":memory:");
    aplicarEsquema(db, schema);

    // Las tablas del esquema tienen columnas extra que SqliteRepository
    // no usa: id, data, creado_en, actualizado_en. Como las tablas del
    // esquema ya cubren esto parcialmente, usamos las tablas directas.

    tenantsRepo = new SqliteRepository<Tenant>(db, "tenants");
    expedientesRepo = new SqliteRepository<Expediente>(db, "expedientes");
    preservacionRepo = new SqliteRepository<RegistroPatrimonial>(
      db,
      "registros_patrimoniales"
    );
    ciudadanoRepo = new SqliteRepository<RegistroCiudadano>(
      db,
      "reportes_ciudadanos"
    );
    distribucionRepo = new SqliteRepository<Distribucion>(db, "distribuciones");

    tenants = new TenantsService(tenantsRepo);
    ingest = new IngestService(expedientesRepo);
    pipeline = new PipelineService();
    preservation = new PreservationService(preservacionRepo);
    citizen = new CitizenService(ciudadanoRepo);
    distribution = new DistributionService(distribucionRepo);

    periodista = crearActor({
      userId: "u-p1",
      nombre: "Periodista",
      rol: "periodista",
      tenantId: "monitor-noticias",
    });
  });

  afterEach(() => {
    db.close();
  });

  it("crea tenant y persiste en SQLite", () => {
    const t = tenants.crear({
      id: "monitor-noticias",
      nombre: "Monitor Noticias",
      tipo: "medio",
      territorioId: "oaxaca",
    });
    expect(t.id).toBe("monitor-noticias");
    expect(tenantsRepo.contar()).toBe(1);

    // Verificar que se guardo en la base de datos
    const fila = db
      .prepare("SELECT data FROM tenants WHERE id = ?")
      .get("monitor-noticias") as { data: string } | undefined;
    expect(fila).toBeDefined();
    expect(fila?.data).toContain("Monitor Noticias");
  });

  it("nuevo servicio lee el mismo tenant desde SQLite", () => {
    tenants.crear({
      id: "monitor-noticias",
      nombre: "Monitor Noticias",
      tipo: "medio",
      territorioId: "oaxaca",
    });

    // Crear un nuevo servicio sobre el mismo repo
    const otroServicio = new TenantsService(tenantsRepo);
    const leido = otroServicio.obtenerPorId("monitor-noticias");
    expect(leido).not.toBeNull();
    expect(leido?.nombre).toBe("Monitor Noticias");
  });

  it("ingesta con SQLite persiste el expediente", () => {
    const tenant = tenants.crear({
      id: "monitor-noticias",
      nombre: "Monitor Noticias",
      tipo: "medio",
      territorioId: "oaxaca",
    });

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
    expect(expedientesRepo.contar()).toBe(1);

    // Verificar en la base de datos directa
    const fila = db
      .prepare("SELECT data FROM expedientes WHERE id = ?")
      .get("CIID-2026-0001") as { data: string } | undefined;
    expect(fila).toBeDefined();
    const parsed = JSON.parse(fila!.data) as { etapaActual: string };
    expect(parsed.etapaActual).toBe("PROCESSING");
  });

  it("preservacion con SQLite guarda el registro patrimonial", () => {
    const tenant = tenants.crear({
      id: "monitor-noticias",
      nombre: "Monitor Noticias",
      tipo: "medio",
      territorioId: "oaxaca",
    });

    const rIng = ingest.recibir(
      {
        id: "CIID-2026-0002",
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

    const rPres = preservation.preservar({
      expediente: rPub.expediente,
      actor: periodista,
    });
    expect(rPres.exito).toBe(true);
    expect(preservacionRepo.contar()).toBe(1);

    const fila = db
      .prepare("SELECT data FROM registros_patrimoniales WHERE id = ?")
      .get("CIID-2026-0002") as { data: string } | undefined;
    expect(fila).toBeDefined();
    expect(fila?.data).toContain("sha-local-");
  });

  it("reporte ciudadano con SQLite persiste correctamente", () => {
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

    expect(ciudadanoRepo.contar()).toBe(1);

    const fila = db
      .prepare("SELECT data FROM reportes_ciudadanos WHERE id = ?")
      .get("CIU-2026-0001") as { data: string } | undefined;
    expect(fila).toBeDefined();
    const parsed = JSON.parse(fila!.data) as { estado: string; canal: string };
    expect(parsed.estado).toBe("activo");
    expect(parsed.canal).toBe("whatsapp");
  });

  it("distribucion con SQLite persiste correctamente", () => {
    distribution.distribuir({
      id: "DIS-001",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      canal: "web",
      titulo: "Titulo",
      cuerpo: "Cuerpo",
      creadaPor: "u-p1",
    });

    expect(distribucionRepo.contar()).toBe(1);

    const fila = db
      .prepare("SELECT data FROM distribuciones WHERE id = ?")
      .get("DIS-001") as { data: string } | undefined;
    expect(fila).toBeDefined();
    const parsed = JSON.parse(fila!.data) as { canal: string; estado: string };
    expect(parsed.canal).toBe("web");
    expect(parsed.estado).toBe("activa");
  });

  it("flujo completo con SQLite: tenant -> ingesta -> preservation", () => {
    const tenant = tenants.crear({
      id: "monitor-noticias",
      nombre: "Monitor Noticias",
      tipo: "medio",
      territorioId: "oaxaca",
    });

    const rIng = ingest.recibir(
      {
        id: "CIID-2026-0003",
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

    // Verificar que todas las tablas tienen datos
    expect(tenantsRepo.contar()).toBe(1);
    expect(expedientesRepo.contar()).toBe(1);
    expect(preservacionRepo.contar()).toBe(1);
  });

  it("aísla datos por tenant en SQLite", () => {
    const tA = tenants.crear({
      id: "monitor-noticias",
      nombre: "Monitor A",
      tipo: "medio",
      territorioId: "oaxaca",
    });
    const tB = tenants.crear({
      id: "municipio-a",
      nombre: "Municipio A",
      tipo: "municipio",
      territorioId: "oaxaca",
    });

    ingest.recibir(
      {
        id: "CIID-2026-0004",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      },
      tA
    );
    ingest.recibir(
      {
        id: "CIID-2026-0005",
        tenantId: "municipio-a",
        origen: "institucional",
        territorio: { estado: "Oaxaca" },
      },
      tB
    );

    expect(ingest.listarPorTenant("monitor-noticias").length).toBe(1);
    expect(ingest.listarPorTenant("municipio-a").length).toBe(1);
    expect(expedientesRepo.contar()).toBe(2);
  });

  it("persiste a traves de multiples servicios con el mismo repo", () => {
    tenants.crear({
      id: "monitor-noticias",
      nombre: "Monitor Noticias",
      tipo: "medio",
      territorioId: "oaxaca",
    });

    // Crear nuevo servicio sobre el mismo repositorio
    const nuevoIngest = new IngestService(expedientesRepo);
    const tenant = tenants.obtenerPorId("monitor-noticias");
    if (!tenant) throw new Error("tenant faltante");

    nuevoIngest.recibir(
      {
        id: "CIID-2026-0006",
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      },
      tenant
    );

    expect(ingest.obtenerPorId("CIID-2026-0006")).not.toBeNull();
    expect(expedientesRepo.contar()).toBe(1);
  });
});
